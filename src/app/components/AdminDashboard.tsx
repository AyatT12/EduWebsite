import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, UserCheck, School, FileText,
  BarChart3, Settings, Loader, TrendingUp, Shield, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const API = 'http://localhost:3001';
const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalParents: 0, totalClasses: 0, totalSubjects: 0, activeUsers: 0 });
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [students, teachers, parents, classes, subjects, users, grades, attendance, notes] = await Promise.all([
        fetch(`${API}/students`).then(r => r.json()),
        fetch(`${API}/teachers`).then(r => r.json()),
        fetch(`${API}/parents`).then(r => r.json()),
        fetch(`${API}/classes`).then(r => r.json()),
        fetch(`${API}/subjects`).then(r => r.json()),
        fetch(`${API}/users`).then(r => r.json()),
        fetch(`${API}/grades`).then(r => r.json()),
        fetch(`${API}/attendance`).then(r => r.json()),
        fetch(`${API}/notes`).then(r => r.json()),
      ]);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length,
        totalClasses: classes.length,
        totalSubjects: subjects.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
      });

      const gradeCounts = grades.reduce((acc: any, g: any) => {
        acc[g.grade] = (acc[g.grade] || 0) + 1;
        return acc;
      }, {});
      setGradeData(Object.entries(gradeCounts).map(([name, value]) => ({ name, value })));

      const attCounts = attendance.reduce((acc: any, a: any) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});
      setAttendanceData(Object.entries(attCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), value
      })));

      setRecentActivity([
        ...grades.slice(-3).map((g: any) => ({ type: 'grade', text: `Grade added for student #${g.studentId}`, date: g.date })),
        ...notes.slice(-2).map((n: any) => ({ type: 'note', text: `Note added for student #${n.studentId}`, date: n.date })),
        ...attendance.slice(-2).map((a: any) => ({ type: 'attendance', text: `Attendance marked for student #${a.studentId}`, date: a.date })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Manage Students', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Manage Teachers', path: '/admin/teachers', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Manage Parents', path: '/admin/parents', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Manage Classes', path: '/admin/classes', icon: <School className="w-5 h-5" /> },
    { label: 'Manage Subjects', path: '/admin/subjects', icon: <FileText className="w-5 h-5" /> },
    { label: 'Manage Users', path: '/admin/users', icon: <Shield className="w-5 h-5" /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const statsCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: <Users className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/admin/students' },
    { label: 'Total Teachers', value: stats.totalTeachers, icon: <BookOpen className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', path: '/admin/teachers' },
    { label: 'Total Parents', value: stats.totalParents, icon: <UserCheck className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', path: '/admin/parents' },
    { label: 'Total Classes', value: stats.totalClasses, icon: <School className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/admin/classes' },
    { label: 'Total Subjects', value: stats.totalSubjects, icon: <FileText className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', path: '/admin/subjects' },
    { label: 'Active Users', value: stats.activeUsers, icon: <Shield className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', path: '/admin/users' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout navItems={navItems} role="admin">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl mb-1">Admin Dashboard</h1>
          <p className="text-red-100 text-sm">System-wide overview · {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-red-300 dark:hover:border-red-700 transition-colors" onClick={() => navigate(s.path)}>
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className="text-3xl text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              <p className={`text-xs ${s.color} mt-2`}>View & manage →</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Grade Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={gradeData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Attendance Overview</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions + Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Student', icon: <Users className="w-5 h-5" />, path: '/admin/students', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                { label: 'Add Teacher', icon: <BookOpen className="w-5 h-5" />, path: '/admin/teachers', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
                { label: 'Manage Classes', icon: <School className="w-5 h-5" />, path: '/admin/classes', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                { label: 'System Users', icon: <Shield className="w-5 h-5" />, path: '/admin/users', color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  className={`flex items-center gap-3 p-3 rounded-xl ${a.color} transition-opacity hover:opacity-80`}>
                  {a.icon}
                  <span className="text-sm">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${act.type === 'grade' ? 'bg-blue-500' : act.type === 'note' ? 'bg-green-500' : 'bg-green-500'}`} />
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{act.text}</p>
                  <span className="text-xs text-gray-400">{act.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
