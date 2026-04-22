import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader, Search, Users, LayoutDashboard, BookOpen, UserCheck, School, FileText, BarChart3, Shield } from 'lucide-react';
import DashboardLayout from '../DashboardLayout';

const API = 'http://localhost:3001';
interface Subject { id: number; name: string; code: string; teacherId: number; classIds: number[]; credits: number; color: string; }
interface Teacher { id: number; name: string; }

const emptyForm = { name: '', code: '', teacherId: '', credits: '3', color: 'blue' };

export default function ManageSubjectsAdmin() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [s, t] = await Promise.all([
      fetch(`${API}/subjects`).then(r => r.json()),
      fetch(`${API}/teachers`).then(r => r.json()),
    ]);
    setSubjects(s); setTeachers(t); setIsLoading(false);
  };

  const openAdd = () => { setEditingId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (s: Subject) => {
    setEditingId(s.id);
    setForm({ name: s.name, code: s.code, teacherId: String(s.teacherId), credits: String(s.credits), color: s.color });
    setShowModal(true);
  };

  const save = async () => {
    const payload = { ...form, teacherId: parseInt(form.teacherId), credits: parseInt(form.credits), classIds: [] };
    if (editingId) {
      await fetch(`${API}/subjects/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editingId }) });
    } else {
      await fetch(`${API}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setShowModal(false); loadData();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this subject?')) return;
    await fetch(`${API}/subjects/${id}`, { method: 'DELETE' });
    loadData();
  };

  const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));

  const colorDots: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', green: 'bg-green-500', orange: 'bg-orange-500', blue: 'bg-blue-500',
  };

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

  return (
    <DashboardLayout navItems={navItems} role="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-gray-900 dark:text-white">Manage Subjects</h1>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader className="w-8 h-8 text-red-600 animate-spin" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(sub => {
              const teacher = teachers.find(t => t.id === sub.teacherId);
              return (
                <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorDots[sub.color] || 'bg-gray-400'}`} />
                      <h3 className="text-gray-900 dark:text-white">{sub.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(sub)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(sub.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Code</span>
                      <span className="text-gray-700 dark:text-gray-300">{sub.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Teacher</span>
                      <span className="text-gray-700 dark:text-gray-300">{teacher?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Credits</span>
                      <span className="text-gray-700 dark:text-gray-300">{sub.credits}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white">{editingId ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Subject Code</label>
                  <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Credits</label>
                  <input type="number" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Color</label>
                  <select value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {['blue', 'green', 'green', 'orange', 'blue'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Teacher</label>
                  <select value={form.teacherId} onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">Select teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
