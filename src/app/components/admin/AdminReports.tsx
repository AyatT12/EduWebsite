import { useState, useEffect } from 'react';
import { Download, Loader, BarChart3, Users, BookOpen, UserCheck, School, FileText, Shield, LayoutDashboard, TrendingUp, Award, CheckCircle } from 'lucide-react';
import DashboardLayout from '../DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API = 'http://localhost:3001';
const COLORS = ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminReports() {
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [students, teachers, parents, classes, grades, attendance] = await Promise.all([
      fetch(`${API}/students`).then(r => r.json()),
      fetch(`${API}/teachers`).then(r => r.json()),
      fetch(`${API}/parents`).then(r => r.json()),
      fetch(`${API}/classes`).then(r => r.json()),
      fetch(`${API}/grades`).then(r => r.json()),
      fetch(`${API}/attendance`).then(r => r.json()),
    ]);
    setData({ students, teachers, parents, classes, grades, attendance });
    setIsLoading(false);
  };

  const generateSystemReport = async () => {
    setGenerating('system');
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      // Cover
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageW, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('EduManage', 15, 25);
      doc.setFontSize(14);
      doc.text('System-Wide Report', 15, 40);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 15, 55, { align: 'right' });

      // Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Executive Summary', 15, 80);
      doc.line(15, 82, pageW - 15, 82);

      const summary = [
        ['Total Students', String(data.students?.length || 0)],
        ['Total Teachers', String(data.teachers?.length || 0)],
        ['Total Parents', String(data.parents?.length || 0)],
        ['Total Classes', String(data.classes?.length || 0)],
        ['Total Grade Records', String(data.grades?.length || 0)],
        ['Total Attendance Records', String(data.attendance?.length || 0)],
      ];

      autoTable(doc, {
        startY: 87,
        head: [['Metric', 'Count']],
        body: summary,
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 11 },
      });

      // Students table
      const afterSum = (doc as any).lastAutoTable?.finalY + 15 || 150;
      doc.setFontSize(16);
      doc.text('Student Roster', 15, afterSum);
      doc.line(15, afterSum + 2, pageW - 15, afterSum + 2);

      autoTable(doc, {
        startY: afterSum + 7,
        head: [['ID', 'Name', 'Email', 'Status']],
        body: (data.students || []).map((s: any) => [s.id, s.name, s.email, s.status]),
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
      });

      // Footer
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`EduManage School System Report · Page ${p} of ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save('EduManage_System_Report.pdf');
    } catch (e) { console.error(e); } finally { setGenerating(''); }
  };

  const generateGradesReport = async () => {
    setGenerating('grades');
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, pageW, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Academic Grades Report', 15, 25);
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString(), pageW - 15, 35, { align: 'right' });

      // Grade distribution
      const gradeCounts: Record<string, number> = {};
      (data.grades || []).forEach((g: any) => { gradeCounts[g.grade] = (gradeCounts[g.grade] || 0) + 1; });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Grade Distribution', 15, 58);
      doc.line(15, 60, pageW - 15, 60);

      autoTable(doc, {
        startY: 65,
        head: [['Grade', 'Count', 'Percentage']],
        body: Object.entries(gradeCounts).map(([g, c]) => [g, c, `${((c / (data.grades?.length || 1)) * 100).toFixed(1)}%`]),
        headStyles: { fillColor: [124, 58, 237] },
        styles: { fontSize: 11 },
      });

      const afterDist = (doc as any).lastAutoTable?.finalY + 15 || 120;
      doc.setFontSize(14);
      doc.text('All Grade Records', 15, afterDist);
      doc.line(15, afterDist + 2, pageW - 15, afterDist + 2);

      autoTable(doc, {
        startY: afterDist + 7,
        head: [['Student ID', 'Subject ID', 'Exam', 'Marks', 'Grade', 'Term']],
        body: (data.grades || []).map((g: any) => [g.studentId, g.subjectId, g.examType, `${g.marks}/${g.maxMarks}`, g.grade, g.term]),
        headStyles: { fillColor: [124, 58, 237] },
        styles: { fontSize: 9 },
      });

      doc.save('EduManage_Grades_Report.pdf');
    } catch (e) { console.error(e); } finally { setGenerating(''); }
  };

  const generateAttendanceReport = async () => {
    setGenerating('attendance');
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageW, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Attendance Report', 15, 25);
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString(), pageW - 15, 35, { align: 'right' });

      doc.setTextColor(0, 0, 0);
      const present = (data.attendance || []).filter((a: any) => a.status === 'present').length;
      const absent = (data.attendance || []).filter((a: any) => a.status === 'absent').length;
      const late = (data.attendance || []).filter((a: any) => a.status === 'late').length;
      const total = data.attendance?.length || 0;

      doc.setFontSize(14);
      doc.text('Summary', 15, 58);
      autoTable(doc, {
        startY: 63,
        head: [['Status', 'Count', 'Percentage']],
        body: [
          ['Present', present, `${total ? ((present / total) * 100).toFixed(1) : 0}%`],
          ['Absent', absent, `${total ? ((absent / total) * 100).toFixed(1) : 0}%`],
          ['Late', late, `${total ? ((late / total) * 100).toFixed(1) : 0}%`],
        ],
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 11 },
      });

      const afterSum = (doc as any).lastAutoTable?.finalY + 15 || 120;
      doc.setFontSize(14);
      doc.text('Detailed Records', 15, afterSum);
      autoTable(doc, {
        startY: afterSum + 5,
        head: [['Student ID', 'Class ID', 'Date', 'Status', 'Remarks']],
        body: (data.attendance || []).map((a: any) => [a.studentId, a.classId, a.date, a.status, a.remarks || '—']),
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
      });

      doc.save('EduManage_Attendance_Report.pdf');
    } catch (e) { console.error(e); } finally { setGenerating(''); }
  };

  const gradeDistribution = Object.entries(
    (data.grades || []).reduce((acc: Record<string, number>, g: any) => { acc[g.grade] = (acc[g.grade] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const attendanceSummary = ['present', 'absent', 'late'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: (data.attendance || []).filter((a: any) => a.status === s).length,
  }));

  const navItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Teachers', path: '/admin/teachers', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Parents', path: '/admin/parents', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Classes', path: '/admin/classes', icon: <School className="w-5 h-5" /> },
    { label: 'Subjects', path: '/admin/subjects', icon: <FileText className="w-5 h-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Shield className="w-5 h-5" /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  if (isLoading) return (
    <DashboardLayout navItems={navItems} role="admin">
      <div className="flex justify-center py-20"><Loader className="w-10 h-10 text-red-600 animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={navItems} role="admin">
      <div className="space-y-6">
        <h1 className="text-xl text-gray-900 dark:text-white">Reports & Analytics</h1>

        {/* Report Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'System Overview Report', desc: 'Full system statistics including all users, students, teachers, and classes.', icon: <BarChart3 className="w-6 h-6" />, color: 'bg-blue-700', action: generateSystemReport, key: 'system' },
            { title: 'Academic Grades Report', desc: 'Complete grade distribution and individual student grade records.', icon: <Award className="w-6 h-6" />, color: 'bg-green-600', action: generateGradesReport, key: 'grades' },
            { title: 'Attendance Report', desc: 'Detailed attendance records with summary statistics for all students.', icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-600', action: generateAttendanceReport, key: 'attendance' },
          ].map(r => (
            <div key={r.key} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center text-white mb-4`}>{r.icon}</div>
              <h3 className="text-gray-900 dark:text-white mb-2">{r.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{r.desc}</p>
              <button onClick={r.action} disabled={generating === r.key}
                className={`flex items-center gap-2 w-full justify-center py-2 ${r.color} text-white rounded-xl hover:opacity-90 text-sm transition-opacity disabled:opacity-50`}>
                {generating === r.key ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : <><Download className="w-4 h-4" /> Download PDF</>}
              </button>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Grade Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={gradeDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {gradeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Attendance Summary</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendanceSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
