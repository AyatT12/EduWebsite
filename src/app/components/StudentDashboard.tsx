import { useState, useEffect, ReactNode } from 'react';
import {
  LayoutDashboard, BookMarked, ClipboardCheck, Calendar, MessageSquare,
  TrendingUp, Award, Flame, Star, Target, Brain, ChevronRight, Loader,
  CheckCircle, XCircle, Clock, BookOpen, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts';

const API = 'http://localhost:3001';

type TabType = 'overview' | 'grades' | 'attendance' | 'schedule' | 'notes';

interface Grade { id: number; studentId: number; subjectId: number; examType: string; marks: number; maxMarks: number; grade: string; term: string; date: string; feedback: string; }
interface Subject { id: number; name: string; code: string; color: string; teacherId: number; }
interface AttendanceRecord { id: number; studentId: number; classId: number; date: string; status: string; remarks: string; }
interface Note { id: number; studentId: number; teacherId: number; subject: string; content: string; date: string; type: string; }
interface Teacher { id: number; name: string; }
interface ScheduleItem { id: number; classId: number; subjectId: number; teacherId: number; day: string; startTime: string; endTime: string; room: string; }
interface Announcement { id: number; title: string; content: string; date: string; priority: string; }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SUBJECT_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  console.log(user)
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const studentId = user?.studentId;

  useEffect(() => {
    if (studentId) loadData();
  }, [studentId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gradesRes, subjectsRes, attendanceRes, notesRes, teachersRes, scheduleRes, announcementsRes, studentsRes] = await Promise.all([
        fetch(`${API}/grades`).then(r => r.json()),
        fetch(`${API}/subjects`).then(r => r.json()),
        fetch(`${API}/attendance`).then(r => r.json()),
        fetch(`${API}/notes`).then(r => r.json()),
        fetch(`${API}/teachers`).then(r => r.json()),
        fetch(`${API}/schedule`).then(r => r.json()),
        fetch(`${API}/announcements`).then(r => r.json()),
        fetch(`${API}/students/${studentId}`).then(r => r.json()),
      ]);

      const myGrades = gradesRes.filter((g: Grade) => Number(g.studentId) === Number(studentId));
      const myAttendance = attendanceRes.filter((a: AttendanceRecord) => Number(a.studentId) === Number(studentId));
      const myNotes = notesRes.filter((n: Note) => Number(n.studentId) === Number(studentId));
      const mySchedule = scheduleRes.filter((s: ScheduleItem) => studentsRes.classId && s.classId === studentsRes.classId);

      setGrades(myGrades);
      setSubjects(subjectsRes);
      setAttendance(myAttendance);
      setNotes(myNotes);
      setTeachers(teachersRes);
      setSchedule(mySchedule);
      console.log(mySchedule)
      setAnnouncements(announcementsRes);
      setStudentInfo(studentsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Computed Stats ─────────────────────────────────��───────────────────────
  const avgScore = grades.length
    ? Math.round(grades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / grades.length)
    : 0;

  const presentDays = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0;

  const gpa = avgScore >= 93 ? 4.0 : avgScore >= 90 ? 3.7 : avgScore >= 87 ? 3.3 :
    avgScore >= 83 ? 3.0 : avgScore >= 80 ? 2.7 : avgScore >= 77 ? 2.3 :
    avgScore >= 73 ? 2.0 : avgScore >= 70 ? 1.7 : 1.0;

  const streak = 5; // Consecutive days present (demo)

  // Subject performance for radar chart
  const subjectPerformance = subjects.map(sub => {
    const subGrades = grades.filter(g => Number(g.subjectId) === Number(sub.id));
    const avg = subGrades.length ? Math.round(subGrades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / subGrades.length) : 0;
    return { subject: sub.name.slice(0, 5), score: avg };
  });

  // Best subject
  const bestSubject = subjectPerformance.reduce((best, s) => s.score > (best?.score || 0) ? s : best, subjectPerformance[0]);

  // Attendance history grouped by month
  const attendanceByMonth = attendance.reduce((acc: Record<string, { p: number; total: number }>, a) => {
    const month = a.date.slice(0, 7);
    if (!acc[month]) acc[month] = { p: 0, total: 0 };
    acc[month].total++;
    if (a.status === 'present') acc[month].p++;
    return acc;
  }, {});
  const attendanceTrend = Object.entries(attendanceByMonth).map(([month, v]) => ({
    month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
    rate: Math.round((v.p / v.total) * 100),
  }));

  // Study planner recommendations
  const studyPlan = subjectPerformance
    .sort((a, b) => a.score - b.score)
    .map(s => ({
      subject: subjects.find(sub => sub.name.slice(0, 5) === s.subject)?.name || s.subject,
      score: s.score,
      priority: s.score < 70 ? 'High' : s.score < 80 ? 'Medium' : 'Low',
      sessions: s.score < 70 ? 5 : s.score < 80 ? 3 : 1,
      tip: s.score < 70
        ? 'Focus intensively — review fundamentals and past papers'
        : s.score < 80
        ? 'Regular practice — solve 10 problems daily'
        : 'Maintain — weekly review sessions sufficient',
    }));

  const getSubjectByID = (id: number) => subjects.find(s => Number(s.id) === Number(id));
  const getTeacherName = (id: number) => teachers.find(t => Number(t.id) === Number(id))?.name || 'Unknown';

  const navItems = [
    { label: 'Overview', path: '#overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Grades', path: '#grades', icon: <BookMarked className="w-5 h-5" /> },
    { label: 'Attendance', path: '#attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Schedule', path: '#schedule', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Notes', path: '#notes', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const tabs: { key: TabType; label: string; icon: ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'grades', label: 'My Grades', icon: <BookMarked className="w-4 h-4" /> },
    { key: 'attendance', label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { key: 'notes', label: 'Teacher Notes', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout navItems={navItems} role="student">
      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-blue-700 text-white shadow-sm'
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
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-green-600 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h1 className="text-2xl mb-1">Hey, {user?.name?.split(' ')[0]}! 🎓</h1>
              <p className="text-blue-100 text-sm">You're doing great! Keep pushing forward.</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm">
                  <Flame className="w-4 h-4 text-orange-300" />
                  {streak} day streak!
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-300" />
                  {bestSubject?.subject} is your best!
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Overall Score', value: `${avgScore}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', sub: avgScore >= 80 ? '🎉 Excellent!' : 'Keep improving!' },
              { label: 'Current GPA', value: gpa.toFixed(1), icon: <Award className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', sub: gpa >= 3.5 ? '🏆 Dean\'s List' : 'Good standing' },
              { label: 'Attendance', value: `${attendanceRate}%`, icon: <ClipboardCheck className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', sub: `${presentDays}/${attendance.length} days` },
              { label: 'Exams Taken', value: grades.length, icon: <BookMarked className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', sub: `${subjects.length} subjects` },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts + Announcements */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Radar */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Subject Performance Radar</h2>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={subjectPerformance}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Announcements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Announcements</h2>
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className={`p-3 rounded-lg border-l-4 ${
                    ann.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                    ann.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                    'border-green-500 bg-green-50 dark:bg-green-900/10'
                  }`}>
                    <p className="text-sm text-gray-900 dark:text-white">{ann.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ann.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Study Planner */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-900 dark:text-white">Smart Study Planner</h2>
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">AI-Powered</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Based on your performance, here's your personalized study recommendation:</p>
            <div className="space-y-3">
              {studyPlan.map((plan, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{plan.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{plan.tip}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      plan.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      plan.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>{plan.priority}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.sessions}h/week</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MY GRADES ────────────────────────────────────────────────────── */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <h1 className="text-xl text-gray-900 dark:text-white">My Academic Records</h1>

          {/* Subject Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map(sub => {
              const subGrades = grades.filter(g => Number(g.subjectId) === Number(sub.id));
              const avg = subGrades.length ? Math.round(subGrades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / subGrades.length) : 0;
              const latest = subGrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              const colorClass = SUBJECT_COLORS[sub.color] || 'bg-blue-500';
              return (
                <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center text-white text-xs mb-3`}>
                    {sub.name.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{sub.name}</p>
                  <p className="text-2xl text-gray-900 dark:text-white mt-1">{avg}%</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: `${avg}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Latest: {latest ? `${latest.examType} - ${latest.grade}` : 'No exams yet'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Grade Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white">All Grades</h2>
            </div>
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
                  {grades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(g => {
                    const sub = getSubjectByID(Number(g.subjectId));
                    console.log(sub)
                    const colorClass = SUBJECT_COLORS[sub?.color || 'blue'] || 'bg-blue-500';
                    return (
                      <tr key={g.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                            <span className="text-sm text-gray-900 dark:text-gray-100">{sub?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.examType}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {g.marks}/{g.maxMarks}
                          <span className="ml-1 text-xs text-gray-400">({Math.round((g.marks / g.maxMarks) * 100)}%)</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                            g.grade.startsWith('A') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            g.grade.startsWith('B') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            g.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>{g.grade}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.term}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{g.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[160px] truncate" title={g.feedback}>{g.feedback || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Performance by Subject</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── ATTENDANCE ───────────────────────────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <h1 className="text-xl text-gray-900 dark:text-white">My Attendance</h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Present', value: presentDays, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Absent', value: attendance.filter(a => a.status === 'absent').length, icon: <XCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Late', value: attendance.filter(a => a.status === 'late').length, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>{s.icon}</div>
                <p className="text-2xl text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Ring */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#4f46e5" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - attendanceRate / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg text-gray-900 dark:text-white">{attendanceRate}%</span>
                </div>
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white">Overall Attendance Rate</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {attendanceRate >= 90 ? '✅ Excellent! Keep it up.' : attendanceRate >= 75 ? '⚠️ Try to attend more regularly.' : '❌ Low attendance — please improve.'}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{streak} day attendance streak!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          {attendanceTrend.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Monthly Attendance Trend</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Attendance Log */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white">Attendance Log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Date', 'Status', 'Remarks'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(rec => (
                    <tr key={rec.id} className="border-t border-gray-100 dark:border-gray-700/50">
                      <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">{rec.date}</td>
                      <td className="px-4 py-2.5">
                        <span className={`flex items-center gap-1.5 text-xs w-fit px-2 py-0.5 rounded-full ${
                          rec.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          rec.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {rec.status === 'present' ? <CheckCircle className="w-3 h-3" /> : rec.status === 'absent' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">{rec.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCHEDULE ─────────────────────────────────────────────────────── */}
      {activeTab === 'schedule' && (
        <div className="space-y-5">
          <h1 className="text-xl text-gray-900 dark:text-white">My Weekly Schedule</h1>
          <div className="space-y-4">
            {DAYS.map(day => {
              const daySchedule = schedule.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <div key={day} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-900 dark:text-white text-sm">{day}</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {daySchedule.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 px-2 py-1">No classes</p>
                    ) : daySchedule.map(item => {
                      const sub = subjects.find(s => Number(s.id) === Number(item.subjectId));
                      const teacher = teachers.find(t => Number(t.id) === Number(item.teacherId));
                      const colorClass = SUBJECT_COLORS[sub?.color || 'blue'] || 'bg-blue-500';
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                          <div className={`w-1 h-10 ${colorClass} rounded-full flex-shrink-0`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{sub?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{teacher?.name} · Room {item.room}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{item.startTime} – {item.endTime}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── NOTES ────────────────────────────────────────────────────────── */}
      {activeTab === 'notes' && (
        <div className="space-y-5">
          <h1 className="text-xl text-gray-900 dark:text-white">Teacher Notes About You</h1>
          {notes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notes yet from your teachers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map(note => {
                const teacher = teachers.find(t => t.id === note.teacherId);
                const typeColors: Record<string, string> = {
                  academic: 'border-blue-400 bg-blue-50 dark:bg-blue-900/10',
                  behavioral: 'border-orange-400 bg-orange-50 dark:bg-orange-900/10',
                  achievement: 'border-green-400 bg-green-50 dark:bg-green-900/10',
                };
                const typeIcons: Record<string, ReactNode> = {
                  academic: <BookOpen className="w-4 h-4 text-blue-600" />,
                  behavioral: <Zap className="w-4 h-4 text-orange-600" />,
                  achievement: <Star className="w-4 h-4 text-green-600" />,
                };
                return (
                  <div key={note.id} className={`rounded-xl p-5 border-l-4 ${typeColors[note.type] || typeColors.academic} border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {typeIcons[note.type]}
                        <span className="text-sm text-gray-900 dark:text-white">{note.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{note.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{note.content}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">— {teacher?.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
