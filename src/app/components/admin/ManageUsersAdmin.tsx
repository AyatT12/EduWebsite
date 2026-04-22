import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader, Search, Users, LayoutDashboard, BookOpen, UserCheck, School, FileText, BarChart3, Shield, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '../DashboardLayout';

const API = 'http://localhost:3001';

interface User { id: number; email: string; name: string; role: string; status: string; password?: string; }
const emptyForm = { name: '', email: '', password: '', role: 'student', status: 'active' };

export default function ManageUsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...emptyForm });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    setUsers(await fetch(`${API}/users`).then(r => r.json()));
    setIsLoading(false);
  };

  const openAdd = () => { setEditingId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: u.password || '', role: u.role, status: u.status });
    setShowModal(true);
  };

  const save = async () => {
    if (editingId) {
      await fetch(`${API}/users/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id: editingId }) });
    } else {
      await fetch(`${API}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setShowModal(false); loadData();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`${API}/users/${id}`, { method: 'DELETE' });
    loadData();
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const roleBadge: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    teacher: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    parent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
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
          <h1 className="text-xl text-gray-900 dark:text-white">Manage System Users</h1>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
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
                    {['#', 'Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm text-gray-500">{u.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleBadge[u.role] || ''}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>{u.status}</span>
                      </td>
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h2 className="text-gray-900 dark:text-white">{editingId ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {['admin', 'teacher', 'student', 'parent'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {['active', 'inactive', 'suspended'].map(v => <option key={v}>{v}</option>)}
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
