import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader, Search, Users, LayoutDashboard, BookOpen, UserCheck, School, FileText, BarChart3, Shield } from 'lucide-react';
import DashboardLayout from '../DashboardLayout';

const API = 'http://localhost:3001';
interface Parent { id: number; name: string; email: string; phone: string; address: string; occupation: string; studentIds: number[]; }
interface Student { id: number; name: string; }

const emptyForm = { name: '', email: '', phone: '', address: '', occupation: '' };

export default function ManageParentsAdmin() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [p, s] = await Promise.all([
      fetch(`${API}/parents`).then(r => r.json()),
      fetch(`${API}/students`).then(r => r.json()),
    ]);
    setParents(p); setStudents(s); setIsLoading(false);
  };

  const openAdd = () => { setEditingId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (p: Parent) => {
    setEditingId(p.id);
    setForm({ name: p.name, email: p.email, phone: p.phone, address: p.address, occupation: p.occupation });
    setShowModal(true);
  };

  const save = async () => {
    const payload = { ...form, studentIds: [] };
    if (editingId) {
      const existing = parents.find(p => p.id === editingId);
      await fetch(`${API}/parents/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editingId, studentIds: existing?.studentIds || [] }) });
    } else {
      await fetch(`${API}/parents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setShowModal(false); loadData();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this parent?')) return;
    await fetch(`${API}/parents/${id}`, { method: 'DELETE' });
    loadData();
  };

  const filtered = parents.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="text-xl text-gray-900 dark:text-white">Manage Parents</h1>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Parent
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search parents..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader className="w-8 h-8 text-red-600 animate-spin" /></div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['#', 'Name', 'Email', 'Phone', 'Occupation', 'Children', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm text-gray-500">{p.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.occupation}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {(p.studentIds || []).map(sid => students.find(s => s.id === sid)?.name).filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white">{editingId ? 'Edit Parent' : 'Add Parent'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Occupation', key: 'occupation', type: 'text' },
                { label: 'Address', key: 'address', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              ))}
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
