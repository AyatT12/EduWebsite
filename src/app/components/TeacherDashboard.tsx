import { useState, useEffect, ReactNode } from 'react';
import {
  LayoutDashboard, Users, ClipboardCheck, BookMarked, MessageSquare,
  Plus, Save, Trash2, Edit2, X, CheckCircle, XCircle, Clock, Loader,
  TrendingUp, Award, BookOpen, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const API = 'http://localhost:3001';
const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

type TabType = 'overview' | 'students' | 'attendance' | 'grades' | 'notes';

interface Student { id: number; name: string; email: string; classId: number; avatar: string; teacherId: number; }
interface ClassItem { id: number; name: string; grade: string; section: string; room: string; studentIds: number[]; teacherId: number; }
interface Subject { id: number; name: string; code: string; color: string; teacherId: number; }
interface Grade { id: number; studentId: number; subjectId: number; examType: string; marks: number; maxMarks: number; grade: string; term: string; date: string; feedback: string; teacherId: number; }
interface AttendanceRecord { id: number; studentId: number; classId: number; date: string; status: 'present' | 'absent' | 'late'; remarks: string; teacherId: number; }
interface Note { id: number; studentId: number; teacherId: number; subject: string; content: string; date: string; type: string; visibility: string; }

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [myClasses, setMyClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Attendance tab state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, { status: string; remarks: string }>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Grade tab state
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeForm, setGradeForm] = useState({ studentId: '', subjectId: '', examType: '', marks: '', maxMarks: '100', term: 'Fall 2024', feedback: '' });
  // Notes tab state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({ studentId: '', subject: '', content: '', type: 'academic', visibility: 'parent' });
  // attendance modal
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Search
  const [studentSearch, setStudentSearch] = useState('');

  const teacherId = user?.teacherId;

  useEffect(() => {
    if (teacherId) loadData();
  }, [teacherId]);

  const loadData = async () => {
    setIsLoading(true);
    const teacherId = user?.teacherId; 
    try {
      const [classesRes, studentsRes, subjectsRes, gradesRes, attendanceRes, notesRes] = await Promise.all([
        fetch(`${API}/classes`).then(r => r.json()),
        fetch(`${API}/students`).then(r => r.json()),
        fetch(`${API}/subjects`).then(r => r.json()),
        fetch(`${API}/grades`).then(r => r.json()),
        fetch(`${API}/attendance`).then(r => r.json()),
        fetch(`${API}/notes`).then(r => r.json()),
      ]);

      const myClassList = classesRes.filter((c: ClassItem) => Number(c.teacherId) === Number(teacherId));
      const myStudentIds = myClassList.flatMap((c: ClassItem) => (c.studentIds || []).map(Number));

      setMyClasses(myClassList);

      setStudents(studentsRes.filter((s: Student) => myStudentIds.includes(Number(s.id))));
      console.log(students)

      setSubjects(subjectsRes.filter((s: Subject) => Number(s.teacherId) === Number(teacherId)));

      setGrades(gradesRes.filter((s: Subject) => Number(s.teacherId) === Number(teacherId)));

      console.log(grades)

      setAttendance(attendanceRes.filter((a: AttendanceRecord) => Number(a.teacherId) === Number(teacherId)));
      setNotes(notesRes.filter((n: Note) => Number(n.teacherId) === Number(teacherId)));

      if (myClassList.length > 0) setSelectedClass(myClassList[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Attendance ─────────────────────────────────────────────────────────────
  const loadAttendanceForDate = () => {
    if (!selectedClass) return;
    const existing = attendance.filter(a => a.date === attendanceDate && a.classId === selectedClass);
    const map: Record<number, { status: string; remarks: string }> = {};
    const cls = myClasses.find(c => c.id === selectedClass);
    if (cls) {
      (cls.studentIds || []).forEach(sid => {
        const rec = existing.find(a => a.studentId === sid);
        map[sid] = rec ? { status: rec.status, remarks: rec.remarks } : { status: 'present', remarks: '' };
      });
    }
    setAttendanceMap(map);
  };

  useEffect(() => { loadAttendanceForDate(); }, [attendanceDate, selectedClass, attendance]);

  const saveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const cls = myClasses.find(c => c.id === selectedClass);
      if (!cls) return;
      for (const studentId of (cls.studentIds || [])) {
        const entry = attendanceMap[studentId] || { status: 'present', remarks: '' };
        const existing = attendance.find(a => a.date === attendanceDate && a.classId === selectedClass && a.studentId === studentId);
        if (existing) {
          await fetch(`${API}/attendance/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...existing, status: entry.status, remarks: entry.remarks }),
          });
        } else {
          await fetch(`${API}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, classId: selectedClass, date: attendanceDate, status: entry.status, teacherId, remarks: entry.remarks }),
          });
        }
      }
      await loadData();
      alert('Attendance saved successfully!');
    } catch (e) { console.error(e); } finally { setSavingAttendance(false); }
  };

  // ─── Grades ─────────────────────────────────────────────────────────────────
  const openGradeModal = (grade?: Grade) => {
    if (grade) {
      setEditingGrade(grade);
      setGradeForm({ studentId: String(grade.studentId), subjectId: String(grade.subjectId), examType: grade.examType, marks: String(grade.marks), maxMarks: String(grade.maxMarks), term: grade.term, feedback: grade.feedback });
    } else {
      setEditingGrade(null);
      setGradeForm({ studentId: '', subjectId: '', examType: '', marks: '', maxMarks: '100', term: 'Fall 2024', feedback: '' });
    }
    setShowGradeModal(true);
  };

  const calcGradeLetter = (marks: number, max: number): string => {
    const pct = (marks / max) * 100;
    if (pct >= 95) return 'A+'; if (pct >= 90) return 'A'; if (pct >= 85) return 'A-';
    if (pct >= 80) return 'B+'; if (pct >= 75) return 'B'; if (pct >= 70) return 'B-';
    if (pct >= 65) return 'C+'; if (pct >= 60) return 'C'; if (pct >= 55) return 'C-';
    return 'F';
  };

  const saveGrade = async () => {
    const marks = parseInt(gradeForm.marks);
    const maxMarks = parseInt(gradeForm.maxMarks);
    const payload = {
      studentId: parseInt(gradeForm.studentId),
      subjectId: parseInt(gradeForm.subjectId),
      teacherId,
      examType: gradeForm.examType,
      marks, maxMarks,
      grade: calcGradeLetter(marks, maxMarks),
      term: gradeForm.term,
      date: new Date().toISOString().split('T')[0],
      feedback: gradeForm.feedback,
    };
    try {
      if (editingGrade) {
        await fetch(`${API}/grades/${editingGrade.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editingGrade.id }) });
      } else {
        await fetch(`${API}/grades`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setShowGradeModal(false);
      await loadData();
    } catch (e) { console.error(e); }
  };

  const deleteGrade = async (id: number) => {
    if (!confirm('Delete this grade?')) return;
    await fetch(`${API}/grades/${id}`, { method: 'DELETE' });
    await loadData();
  };

  // ─── Notes ──────────────────────────────────────────────────────────────────
  const openNoteModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({ studentId: String(note.studentId), subject: note.subject, content: note.content, type: note.type, visibility: note.visibility });
    } else {
      setEditingNote(null);
      setNoteForm({ studentId: '', subject: '', content: '', type: 'academic', visibility: 'parent' });
    }
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    const payload = { studentId: parseInt(noteForm.studentId), teacherId, subject: noteForm.subject, content: noteForm.content, date: new Date().toISOString().split('T')[0], type: noteForm.type, visibility: noteForm.visibility };
    try {
      if (editingNote) {
        await fetch(`${API}/notes/${editingNote.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editingNote.id }) });
      } else {
        await fetch(`${API}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setShowNoteModal(false);
      await loadData();
    } catch (e) { console.error(e); }
  };

  const deleteNote = async (id: number) => {
    if (!confirm('Delete this note?')) return;
    await fetch(`${API}/notes/${id}`, { method: 'DELETE' });
    await loadData();
  };

  // ─── Overview Stats ──────────────────────────────────────────────────────────
  // console.log(students)
  const totalStudentsCount = students.length;
  const avgGrade = grades.length ? Math.round(grades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / grades.length) : 0;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const totalAttendance = attendance.length;
  const attendanceRate = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Chart: performance by subject
  const subjectPerformance = subjects.map(sub => {
    const subGrades = grades.filter(g => Number(g.subjectId) === Number(sub.id));
    const avg = subGrades.length ? Math.round(subGrades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / subGrades.length) : 0;
    return { subject: sub.name.slice(0, 4), average: avg };
  });

  // Chart: attendance trend by student
  const studentAttendanceStat = students.map(s => {
    const sAtt = attendance.filter(a => Number(a.studentId) === Number(s.id));
    const present = sAtt.filter(a => a.status === 'present').length;
    return { name: s.name.split(' ')[0], rate: sAtt.length ? Math.round((present / sAtt.length) * 100) : 0 };
  });

  const navItems = [
    { label: 'Overview', path: '#overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Students', path: '#students', icon: <Users className="w-5 h-5" /> },
    { label: 'Attendance', path: '#attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Grades', path: '#grades', icon: <BookMarked className="w-5 h-5" /> },
    { label: 'Notes', path: '#notes', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const getStudentName = (id: number) => students.find(s => Number(s.id) === Number(id))?.name || 'Unknown';
  const getSubjectName = (id: number) => subjects.find(s => Number(s.id) === Number(id))?.name || 'Unknown';


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'students', label: 'My Students', icon: <Users className="w-4 h-4" /> },
    { key: 'attendance', label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'grades', label: 'Grades', icon: <BookMarked className="w-4 h-4" /> },
    { key: 'notes', label: 'Notes', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout navItems={navItems} role="teacher">
      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${activeTab === tab.key
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
            <h1 className="text-2xl mb-1">Good morning, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-green-100 text-sm">You have {totalStudentsCount} students across {myClasses.length} classes today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'My Students', value: totalStudentsCount, icon: <Users className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'My Classes', value: myClasses.length, icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Avg Grade', value: `${avgGrade}%`, icon: <Award className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Subject Performance Avg</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="average" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Student Attendance Rate</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={studentAttendanceStat}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="rate" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* My Classes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">My Classes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {myClasses.map(cls => (
                <div key={cls.id} className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-900 dark:text-white">{cls.name}</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">Room {cls.room}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{(cls.studentIds || []).length} students · Grade {cls.grade}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MY STUDENTS ──────────────────────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-gray-900 dark:text-white">My Students ({students.length})</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search students..."
                value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => {
              const sGrades = grades.filter(g => Number(g.studentId) === Number(student.id));
              console.log(sGrades)
              const avgMark = sGrades.length ? Math.round(sGrades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / sGrades.length) : 0;
              const sAtt = attendance.filter(a => Number(a.studentId) === Number(student.id));
              const attRate = sAtt.length ? Math.round((sAtt.filter(a => a.status === 'present').length / sAtt.length) * 100) : 0;
              const cls = myClasses.find(c => (c.studentIds || []).includes(Number(student.id)));
              return (
                <div key={student.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                      {student.avatar || student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{cls?.name || 'No class'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Avg Score</span>
                      <span className={`${avgMark >= 80 ? 'text-green-600' : avgMark >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{avgMark}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${avgMark >= 80 ? 'bg-green-500' : avgMark >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${avgMark}%` }} />
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500 dark:text-gray-400">Attendance</span>
                      <span className="text-blue-600">{attRate}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setActiveTab('grades'); setGradeForm(f => ({ ...f, studentId: String(student.id) })); }} className="flex-1 text-xs py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 transition-colors">Add Grade</button>
                    <button onClick={() => { setActiveTab('notes'); setNoteForm(f => ({ ...f, studentId: String(student.id) })); }} className="flex-1 text-xs py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors">Add Note</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── ATTENDANCE ───────────────────────────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          <h1 className="text-xl text-gray-900 dark:text-white">Record Attendance</h1>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date</label>
              <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Class</label>
              <select value={selectedClass || ''} onChange={e => setSelectedClass(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                {myClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Attendance Cards */}
          <div className="space-y-3">
            {selectedClass && (myClasses.find(c => c.id === selectedClass)?.studentIds || []).map(sid => {
              const student = students.find(s => s.id === sid);
              if (!student) return null;
              const entry = attendanceMap[sid] || { status: 'present', remarks: '' };
              return (
                <div key={sid} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                    {(student.avatar || student.name.slice(0, 2)).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white text-sm">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {(['present', 'absent', 'late'] as const).map(status => (
                      <button key={status}
                        onClick={() => setAttendanceMap(prev => ({ ...prev, [sid]: { ...prev[sid], status } }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${entry.status === status
                          ? status === 'present' ? 'bg-green-500 text-white' : status === 'absent' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {status === 'present' ? <CheckCircle className="w-3 h-3" /> : status === 'absent' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Remarks..."
                    value={entry.remarks}
                    onChange={e => setAttendanceMap(prev => ({ ...prev, [sid]: { ...prev[sid], remarks: e.target.value } }))}
                    className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 w-40 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              );
            })}
          </div>

          <button onClick={saveAttendance} disabled={savingAttendance}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {savingAttendance ? 'Saving...' : 'Save Attendance'}
          </button>
          <button onClick={() => setShowAttendanceModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors">
            <ClipboardCheck className="w-4 h-4" /> Take Attendance
          </button>
          {/* Attendance Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Attendance History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {['Student', 'Date', 'Class', 'Status', 'Remarks'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(-15).reverse().map(rec => {
                    const s = students.find(st => Number(st.id) === Number(rec.studentId));
                    const c = myClasses.find(cl => Number(cl.id) === Number(rec.classId));
                    return (
                      <tr key={rec.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">{s?.name}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{rec.date}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{c?.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${rec.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            rec.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>{rec.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">{rec.remarks || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── GRADES ───────────────────────────────────────────────────────── */}
      {activeTab === 'grades' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-gray-900 dark:text-white">Grade Management</h1>
            <button onClick={() => openGradeModal()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Grade
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Student', 'Subject', 'Exam Type', 'Marks', 'Grade', 'Term', 'Feedback', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grades.map(g => (
                    <tr key={g.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{getStudentName(g.studentId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{getSubjectName(g.subjectId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.examType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{g.marks}/{g.maxMarks}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.grade.startsWith('A') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          g.grade.startsWith('B') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            g.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>{g.grade}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.term}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={g.feedback}>{g.feedback || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openGradeModal(g)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteGrade(g.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
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
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-gray-900 dark:text-white">Student Notes</h1>
            <button onClick={() => openNoteModal()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {notes.map(note => {
              const student = students.find(s => Number(s.id) === note.studentId);
              const typeColors: Record<string, string> = {
                academic: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
                behavioral: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
                achievement: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
              };
              const typeBadge: Record<string, string> = {
                academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                behavioral: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
                achievement: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
              };
              return (
                <div key={note.id} className={`rounded-xl p-5 border ${typeColors[note.type] || typeColors.academic}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                        {student?.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{student?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{note.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[note.type]}`}>{note.type}</span>
                      <button onClick={() => openNoteModal(note)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteNote(note.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white mb-1">{note.subject}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{note.content}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Visible to: {note.visibility}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── GRADE MODAL ──────────────────────────────────────────────────── */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white">{editingGrade ? 'Edit Grade' : 'Add Grade'}</h2>
              <button onClick={() => setShowGradeModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Student</label>
                  <select value={gradeForm.studentId} onChange={e => setGradeForm(f => ({ ...f, studentId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <select value={gradeForm.subjectId} onChange={e => setGradeForm(f => ({ ...f, subjectId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
                  <select value={gradeForm.examType} onChange={e => setGradeForm(f => ({ ...f, examType: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select type</option>
                    {['Quiz 1', 'Quiz 2', 'Midterm', 'Final', 'Assignment', 'Project'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Term</label>
                  <select value={gradeForm.term} onChange={e => setGradeForm(f => ({ ...f, term: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                    {['Fall 2024', 'Spring 2025', 'Summer 2025'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Marks Obtained</label>
                  <input type="number" value={gradeForm.marks} onChange={e => setGradeForm(f => ({ ...f, marks: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 85" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Max Marks</label>
                  <input type="number" value={gradeForm.maxMarks} onChange={e => setGradeForm(f => ({ ...f, maxMarks: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
                <textarea value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                  rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Optional feedback..." />
              </div>
              {gradeForm.marks && gradeForm.maxMarks && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                  Calculated Grade: <strong>{calcGradeLetter(parseInt(gradeForm.marks), parseInt(gradeForm.maxMarks))}</strong> ({Math.round((parseInt(gradeForm.marks) / parseInt(gradeForm.maxMarks)) * 100)}%)
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowGradeModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">Cancel</button>
              <button onClick={saveGrade} className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm transition-colors">Save Grade</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── NOTE MODAL ───────────────────────────────────────────────────── */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white">{editingNote ? 'Edit Note' : 'Add Note'}</h2>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Student</label>
                  <select value={noteForm.studentId} onChange={e => setNoteForm(f => ({ ...f, studentId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={noteForm.type} onChange={e => setNoteForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                    {['academic', 'behavioral', 'achievement'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Subject / Title</label>
                <input value={noteForm.subject} onChange={e => setNoteForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Homework completion" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
                  rows={4} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Write your note here..." />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
                <select value={noteForm.visibility} onChange={e => setNoteForm(f => ({ ...f, visibility: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {['parent', 'student', 'admin'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowNoteModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">Cancel</button>
              <button onClick={saveNote} className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm transition-colors">Save Note</button>
            </div>
          </div>
        </div>
      )}
      {/* ─── ATTENDANCE MODAL ─────────────────────────────────────────────── */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-gray-900 dark:text-white">Take Attendance</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {myClasses.find(c => c.id === selectedClass)?.name} · {attendanceDate}
                </p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student List */}
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {(myClasses.find(c => c.id === selectedClass)?.studentIds || []).map(sid => {
                const student = students.find(s => Number(s.id) === Number(sid));
                if (!student) return null;
                const entry = attendanceMap[sid] || { status: 'present', remarks: '' };
                return (
                  <div key={sid} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">

                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                        {(student.avatar || student.name.slice(0, 2)).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-2">
                      {(['present', 'absent', 'late'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => setAttendanceMap(prev => ({
                            ...prev,
                            [sid]: { ...prev[sid], status }
                          }))}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs flex-1 justify-center transition-all ${entry.status === status
                              ? status === 'present' ? 'bg-green-500 text-white'
                                : status === 'absent' ? 'bg-red-500 text-white'
                                  : 'bg-yellow-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                          {status === 'present' ? <CheckCircle className="w-3.5 h-3.5" />
                            : status === 'absent' ? <XCircle className="w-3.5 h-3.5" />
                              : <Clock className="w-3.5 h-3.5" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Remarks */}
                    <textarea
                      placeholder="Add a remark (optional)..."
                      value={entry.remarks}
                      rows={2}
                      onChange={e => setAttendanceMap(prev => ({
                        ...prev,
                        [sid]: { ...prev[sid], remarks: e.target.value }
                      }))}
                      className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await saveAttendance();
                  setShowAttendanceModal(false);
                }}
                disabled={savingAttendance}
                className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingAttendance ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}