import { useState, useEffect, ReactNode } from 'react';
import {
  LayoutDashboard, BookMarked, ClipboardCheck, MessageSquare, FileText,
  TrendingUp, Award, Download, CheckCircle, XCircle, Clock, Loader,
  Users, BookOpen, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const API = 'http://localhost:3001';
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

type TabType = 'overview' | 'grades' | 'attendance' | 'notes' | 'report';

interface Student { id: number; name: string; email: string; classId: number; dateOfBirth: string; avatar: string; }
interface Grade { id: number; studentId: number; subjectId: number; examType: string; marks: number; maxMarks: number; grade: string; term: string; date: string; feedback: string; }
interface Subject { id: number; name: string; code: string; color: string; teacherId: number; }
interface AttendanceRecord { id: number; studentId: number; classId: number; date: string; status: string; remarks: string; }
interface Note { id: number; studentId: number; teacherId: number; subject: string; content: string; date: string; type: string; visibility: string; }
interface Teacher { id: number; name: string; qualification: string; }
interface ClassItem { id: number; name: string; grade: string; section: string; room: string; }

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const parentId = user?.parentId;

  useEffect(() => {
    if (parentId) loadData();
  }, [parentId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [parentRes, studentsRes, gradesRes, subjectsRes, attendanceRes, notesRes, teachersRes, classesRes] = await Promise.all([
        fetch(`${API}/parents/${parentId}`).then(r => r.json()),
        fetch(`${API}/students`).then(r => r.json()),
        fetch(`${API}/grades`).then(r => r.json()),
        fetch(`${API}/subjects`).then(r => r.json()),
        fetch(`${API}/attendance`).then(r => r.json()),
        fetch(`${API}/notes`).then(r => r.json()),
        fetch(`${API}/teachers`).then(r => r.json()),
        fetch(`${API}/classes`).then(r => r.json()),
      ]);

      const myChildren = studentsRes.filter((s: Student) => (parentRes.studentIds || []).includes(Number(s.id)));
      setChildren(myChildren);
      if (myChildren.length > 0) setSelectedChild(myChildren[0].id);

      setGrades(gradesRes);
      setSubjects(subjectsRes);
      setAttendance(attendanceRes);
      setNotes(notesRes.filter((n: Note) => n.visibility === 'parent' || n.visibility === 'student'));
      setTeachers(teachersRes);
      setClasses(classesRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const child = children.find(c => Number(c.id) === Number(selectedChild));
  const childGrades = grades.filter(g => Number(g.studentId) === Number(selectedChild));
  const childAttendance = attendance.filter(a => Number(a.studentId) === Number(selectedChild));
  const childNotes = notes.filter(n => Number(n.studentId) === Number(selectedChild));
  const childClass = classes.find(c => Number(c.id) === child?.classId);

  const avgScore = childGrades.length
    ? Math.round(childGrades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / childGrades.length)
    : 0;
  const presentDays = childAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = childAttendance.length ? Math.round((presentDays / childAttendance.length) * 100) : 0;
  const gpa = avgScore >= 93 ? 4.0 : avgScore >= 87 ? 3.7 : avgScore >= 80 ? 3.3 : avgScore >= 73 ? 3.0 : 2.0;

  const subjectPerformance = subjects.map(sub => {
    const subGrades = childGrades.filter(g => Number(g.subjectId) === Number(sub.id));
    const avg = subGrades.length ? Math.round(subGrades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / subGrades.length) : 0;
    return { subject: sub.name.slice(0, 5), average: avg };
  });

  const attendancePieData = [
    { name: 'Present', value: presentDays },
    { name: 'Absent', value: childAttendance.filter(a => a.status === 'absent').length },
    { name: 'Late', value: childAttendance.filter(a => a.status === 'late').length },
  ].filter(d => d.value > 0);

  // ─── PDF Report ─────────────────────────────────────────────────────────────
  const generatePDF = async () => {
    if (!child) return;
    setGeneratingPDF(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageW, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('EduManage School', 15, 18);
      doc.setFontSize(11);
      doc.text('Student Progress Report', 15, 30);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW - 15, 30, { align: 'right' });

      // Student Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Student Information', 15, 55);
      doc.setFontSize(10);
      doc.setDrawColor(79, 70, 229);
      doc.line(15, 57, pageW - 15, 57);

      const infoData = [
        ['Name:', child.name, 'Class:', childClass?.name || 'N/A'],
        ['Email:', child.email, 'DOB:', child.dateOfBirth],
        ['Avg Score:', `${avgScore}%`, 'GPA:', gpa.toFixed(1)],
        ['Attendance:', `${attendanceRate}%`, 'Total Exams:', String(childGrades.length)],
      ];
      infoData.forEach((row, i) => {
        const y = 65 + i * 8;
        doc.setFont('helvetica', 'bold');
        doc.text(row[0], 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], 45, y);
        doc.setFont('helvetica', 'bold');
        doc.text(row[2], 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(row[3], 140, y);
      });

      // Grades Table
      doc.setFontSize(14);
      doc.text('Academic Grades', 15, 105);
      doc.line(15, 107, pageW - 15, 107);

      autoTable(doc, {
        startY: 112,
        head: [['Subject', 'Exam Type', 'Marks', 'Grade', 'Term', 'Feedback']],
        body: childGrades.map(g => [
          subjects.find(s => Number(s.id) === Number(g.subjectId))?.name || 'N/A',
          g.examType,
          `${g.marks}/${g.maxMarks}`,
          g.grade,
          g.term,
          g.feedback || '—',
        ]),
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 247, 255] },
        styles: { fontSize: 9 },
      });

      // Attendance Table
      const afterGrades = (doc as any).lastAutoTable?.finalY || 150;
      doc.setFontSize(14);
      doc.text('Attendance Record', 15, afterGrades + 15);
      doc.line(15, afterGrades + 17, pageW - 15, afterGrades + 17);

      autoTable(doc, {
        startY: afterGrades + 22,
        head: [['Date', 'Status', 'Remarks']],
        body: childAttendance.map(a => [a.date, a.status.charAt(0).toUpperCase() + a.status.slice(1), a.remarks || '—']),
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 255, 250] },
        styles: { fontSize: 9 },
      });

      // Notes
      const afterAtt = (doc as any).lastAutoTable?.finalY || 200;
      if (childNotes.length > 0) {
        doc.addPage();
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, pageW, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('Teacher Notes', 15, 14);
        doc.setTextColor(0, 0, 0);

        childNotes.forEach((note, i) => {
          const y = 30 + i * 35;
          const teacher = teachers.find(t => t.id === note.teacherId);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${note.subject} — ${teacher?.name || 'Teacher'}`, 15, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const lines = doc.splitTextToSize(note.content, pageW - 30);
          doc.text(lines, 15, y + 6);
          doc.setTextColor(150, 150, 150);
          doc.text(note.date, 15, y + 14);
          doc.setTextColor(0, 0, 0);
        });
      }

      // Footer
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`EduManage School Management System · Page ${p} of ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`${child.name.replace(/\s+/g, '_')}_Progress_Report.pdf`);
    } catch (e) {
      console.error('PDF error:', e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const navItems = [
    { label: 'Overview', path: '#overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Grades', path: '#grades', icon: <BookMarked className="w-5 h-5" /> },
    { label: 'Attendance', path: '#attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Notes', path: '#notes', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Report', path: '#report', icon: <FileText className="w-5 h-5" /> },
  ];

  const tabs: { key: TabType; label: string; icon: ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'grades', label: 'Grades', icon: <BookMarked className="w-4 h-4" /> },
    { key: 'attendance', label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'notes', label: 'Teacher Notes', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'report', label: 'PDF Report', icon: <FileText className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout navItems={navItems} role="parent">
      {/* Child Selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-4">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                selectedChild === c.id ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}>
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs">
                {c.name.slice(0, 1)}
              </div>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && child && (
        <div className="space-y-6">
          {/* Child Profile Card */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {child.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl mb-0.5">{child.name}</h1>
                <p className="text-green-100">{childClass?.name} · {child.email}</p>
                <p className="text-green-100 text-sm mt-1">DOB: {child.dateOfBirth}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Avg Score', value: `${avgScore}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'GPA', value: gpa.toFixed(1), icon: <Award className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { label: 'Attendance', value: `${attendanceRate}%`, icon: <ClipboardCheck className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Teacher Notes', value: childNotes.length, icon: <MessageSquare className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                <p className="text-2xl text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Subject Performance</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="average" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Attendance Breakdown</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={attendancePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {attendancePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Notes */}
          {childNotes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Recent Teacher Notes</h2>
              <div className="space-y-3">
                {childNotes.slice(0, 3).map(note => {
                  const teacher = teachers.find(t => t.id === note.teacherId);
                  return (
                    <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-900 dark:text-white">{note.subject}</span>
                        <span className="text-xs text-gray-400">{note.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">— {teacher?.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── GRADES ───────────────────────────────────────────────────────── */}
      {activeTab === 'grades' && (
        <div className="space-y-5">
          <h1 className="text-xl text-gray-900 dark:text-white">{child?.name}'s Grades</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Subject', 'Exam', 'Marks', 'Grade', 'Term', 'Date', 'Feedback'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {childGrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(g => (
                    <tr key={g.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{subjects.find(s => Number(s.id) === g.subjectId)?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.examType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{g.marks}/{g.maxMarks}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          g.grade.startsWith('A') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          g.grade.startsWith('B') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>{g.grade}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.term}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{g.feedback || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── ATTENDANCE ───────────────────────────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          <h1 className="text-xl text-gray-900 dark:text-white">{child?.name}'s Attendance</h1>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Present', value: presentDays, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Absent', value: childAttendance.filter(a => a.status === 'absent').length, icon: <XCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Late', value: childAttendance.filter(a => a.status === 'late').length, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>{s.icon}</div>
                <p className="text-2xl text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Date', 'Status', 'Remarks'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {childAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(rec => (
                    <tr key={rec.id} className="border-t border-gray-100 dark:border-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{rec.date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          rec.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>{rec.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{rec.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── NOTES ────────────────────────────────────────────────────────── */}
      {activeTab === 'notes' && (
        <div className="space-y-5">
          <h1 className="text-xl text-gray-900 dark:text-white">Teacher Notes for {child?.name}</h1>
          {childNotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notes have been shared yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {childNotes.map(note => {
                const teacher = teachers.find(t => t.id === note.teacherId);
                const typeColors: Record<string, string> = {
                  academic: 'border-blue-400',
                  behavioral: 'border-orange-400',
                  achievement: 'border-green-400',
                };
                return (
                  <div key={note.id} className={`bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 border-l-4 ${typeColors[note.type] || typeColors.academic}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{note.subject}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{teacher?.name} · {note.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        note.type === 'achievement' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        note.type === 'behavioral' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>{note.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{note.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── REPORT ───────────────────────────────────────────────────────── */}
      {activeTab === 'report' && child && (
        <div className="space-y-6">
          <h1 className="text-xl text-gray-900 dark:text-white">Generate Progress Report</h1>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-lg flex-shrink-0">
                {child.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 dark:text-white">{child.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{childClass?.name} · {child.email}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Avg Score', value: `${avgScore}%` },
                    { label: 'GPA', value: gpa.toFixed(1) },
                    { label: 'Attendance', value: `${attendanceRate}%` },
                    { label: 'Total Exams', value: String(childGrades.length) },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 text-center">
                      <p className="text-lg text-gray-900 dark:text-white">{s.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <h3 className="text-gray-900 dark:text-white mb-2">Report Contents</h3>
            <ul className="space-y-2">
              {['Student profile & class information', `${childGrades.length} grade records across all subjects`, `${childAttendance.length} attendance records`, `${childNotes.length} teacher notes`, 'Performance summary & GPA'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={generatePDF} disabled={generatingPDF}
            className="flex items-center gap-3 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {generatingPDF ? (
              <><Loader className="w-4 h-4 animate-spin" /> Generating PDF...</>
            ) : (
              <><Download className="w-4 h-4" /> Download PDF Report</>
            )}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
