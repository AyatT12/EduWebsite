import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader, Search, Users, LayoutDashboard, BookOpen, UserCheck, School, FileText, BarChart3, Shield } from 'lucide-react';
import DashboardLayout from '../DashboardLayout';

const API = 'http://localhost:3001';

interface ClassItem { id: number; name: string; grade: string; section: string; teacherId: number; room: string; capacity: number; academicYear: string; }
interface Teacher { id: number; name: string; }

const emptyForm = { name: '', grade: '', section: '', teacherId: '', room: '', capacity: '30', academicYear: '2024-2025' };

export default function ManageClassesAdmin() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [c, t] = await Promise.all([
      fetch(`${API}/classes`).then(r => r.json()),
      fetch(`${API}/teachers`).then(r => r.json()),
    ]);
    setClasses(c); setTeachers(t); setIsLoading(false);
  };

  const openAdd = () => { setEditingId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (c: ClassItem) => {
    setEditingId(c.id);
    setForm({ name: c.name, grade: c.grade, section: c.section, teacherId: String(c.teacherId), room: c.room, capacity: String(c.capacity), academicYear: c.academicYear });
    setShowModal(true);
  };

  const save = async () => {
    const payload = { ...form, teacherId: parseInt(form.teacherId), capacity: parseInt(form.capacity) };
    if (editingId) {
      await fetch(`${API}/classes/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editingId }) });
    } else {
      await fetch(`${API}/classes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setShowModal(false); loadData();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this class?')) return;
    await fetch(`${API}/classes/${id}`, { method: 'DELETE' });
    loadData();
  };

  const filtered = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="text-xl text-gray-900 dark:text-white">Manage Classes</h1>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search classes..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader className="w-8 h-8 text-red-600 animate-spin" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cls => {
              const teacher = teachers.find(t => t.id === cls.teacherId);
              return (
                <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-gray-900 dark:text-white">{cls.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Grade {cls.grade} · Section {cls.section}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(cls)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(cls.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Teacher</span>
                      <span className="text-gray-700 dark:text-gray-300">{teacher?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Room</span>
                      <span className="text-gray-700 dark:text-gray-300">{cls.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Capacity</span>
                      <span className="text-gray-700 dark:text-gray-300">{cls.capacity} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Year</span>
                      <span className="text-gray-700 dark:text-gray-300">{cls.academicYear}</span>
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
              <h2 className="text-gray-900 dark:text-white">{editingId ? 'Edit Class' : 'Add Class'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Class Name', key: 'name', type: 'text' },
                  { label: 'Grade', key: 'grade', type: 'text' },
                  { label: 'Section', key: 'section', type: 'text' },
                  { label: 'Room', key: 'room', type: 'text' },
                  { label: 'Capacity', key: 'capacity', type: 'number' },
                  { label: 'Academic Year', key: 'academicYear', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class Teacher</label>
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
