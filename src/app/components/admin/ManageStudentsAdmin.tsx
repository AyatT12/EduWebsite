import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader, Search, Users, LayoutDashboard, BookOpen, UserCheck, School, FileText, BarChart3, Shield } from 'lucide-react';
import DashboardLayout from '../DashboardLayout';

const API = 'http://localhost:3001';

interface Student {
  id: string; name: string; email: string; classId: number | null; parentId: number;
  dateOfBirth: string; address: string; phone: string; status: string;
  enrollmentDate: string; avatar?: string; userId?: string | null;
}

interface ClassItem { id: string; name: string; teacherId: number; studentIds: number[]; }

const emptyForm = {
  name: '', email: '', classId: '', parentId: '', dateOfBirth: '',
  address: '', phone: '', status: 'active',
  enrollmentDate: new Date().toISOString().split('T')[0],
};

export default function ManageStudentsAdmin() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [s, c] = await Promise.all([
      fetch(`${API}/students`).then(r => r.json()),
      fetch(`${API}/classes`).then(r => r.json()),
    ]);
    setStudents(s);
    setClasses(c);
    setIsLoading(false);
  };

  // ── Auto-create user account with password = firstname123 ─────────────────
  const createUserAccount = async (name: string, email: string, studentId: string) => {
    const firstName = name.trim().split(' ')[0].toLowerCase();
    await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: `${firstName}123`,
        role: 'student',
        name,
        status: 'active',
        studentId: Number(studentId),
      }),
    });
  };

  // ── Add student to class studentIds ───────────────────────────────────────
  const linkToClass = async (studentId: string, classId: string) => {
    const cls = classes.find(c => String(c.id) === String(classId));
    if (!cls) return;
    const updatedIds = [...new Set([...(cls.studentIds || []), Number(studentId)])];
    await fetch(`${API}/classes/${classId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cls, studentIds: updatedIds }),
    });
  };

  // ── Remove student from class studentIds ──────────────────────────────────
  const unlinkFromClass = async (studentId: string, classId: number | null) => {
    if (!classId) return;
    const cls = classes.find(c => Number(c.id) === classId);
    if (!cls) return;
    const updatedIds = (cls.studentIds || []).filter(id => Number(id) !== Number(studentId));
    await fetch(`${API}/classes/${cls.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cls, studentIds: updatedIds }),
    });
  };

  // ── Open modal ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingStudent(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({
      name: s.name, email: s.email,
      classId: s.classId ? String(s.classId) : '',
      parentId: s.parentId ? String(s.parentId) : '',
      dateOfBirth: s.dateOfBirth || '', address: s.address || '',
      phone: s.phone || '', status: s.status || 'active',
      enrollmentDate: s.enrollmentDate || new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
  if (!form.name.trim() || !form.email.trim()) {
    alert('Name and email are required.');
    return;
  }
  setSaving(true);
  try {
    const avatar = form.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // ── Fix 3: Generate numeric ID ────────────────────────────────────────
    const allStudents = await fetch(`${API}/students`).then(r => r.json());
    const maxId = allStudents.reduce((max: number, s: any) => Math.max(max, Number(s.id) || 0), 0);
    const newStudentId = String(maxId + 1);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      classId: form.classId ? Number(form.classId) : null,
      parentId: Number(form.parentId) || 0,
      dateOfBirth: form.dateOfBirth,
      address: form.address,
      phone: form.phone,
      status: form.status,
      enrollmentDate: form.enrollmentDate,
      avatar,
    };

    if (editingStudent) {
      await fetch(`${API}/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: editingStudent.id }),
      });

      const oldClassId = editingStudent.classId;
      const newClassId = form.classId;
      if (String(oldClassId) !== String(newClassId)) {
        await unlinkFromClass(editingStudent.id, oldClassId);
        if (newClassId) await linkToClass(editingStudent.id, newClassId);
      }
    } else {
      // ── Fix 3: POST with explicit numeric ID ─────────────────────────────
      await fetch(`${API}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: newStudentId }),
      });

      // ── Fix 1: Create user and get back the new user's ID ─────────────────
      const firstName = form.name.trim().split(' ')[0].toLowerCase();
      const allUsers = await fetch(`${API}/users`).then(r => r.json());
      const maxUserId = allUsers.reduce((max: number, u: any) => Math.max(max, Number(u.id) || 0), 0);
      const newUserId = String(maxUserId + 1);

      await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newUserId,
          email: form.email.trim(),
          password: `${firstName}123`,
          role: 'student',
          name: form.name.trim(),
          status: 'active',
          studentId: Number(newStudentId),
        }),
      });

      // ── Fix 1: Update student record with userId ──────────────────────────
      await fetch(`${API}/students/${newStudentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(newUserId) }),
      });

      // ── Fix 2: Add student to parent's studentIds ─────────────────────────
      if (form.parentId) {
        const parent = await fetch(`${API}/parents/${form.parentId}`).then(r => r.json());
        if (parent && !parent.error) {
          await fetch(`${API}/parents/${form.parentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentIds: [...new Set([...(parent.studentIds || []), Number(newStudentId)])]
            }),
          });
        }
      }

      // Link to class
      if (form.classId) await linkToClass(newStudentId, form.classId);
    }

    setShowModal(false);
    await loadData();
  } catch (e) {
    console.error(e);
    alert('Failed to save student.');
  } finally {
    setSaving(false);
  }
}; 

  // ── Delete ────────────────────────────────────────────────────────────────
  const remove = async (student: Student) => {
    if (!confirm(`Delete ${student.name}? Their user account will also be removed.`)) return;
    try {
      // Remove from class
      await unlinkFromClass(student.id, student.classId);

      // Delete student record
      await fetch(`${API}/students/${student.id}`, { method: 'DELETE' });

      // Delete linked user account
      const users = await fetch(`${API}/users`).then(r => r.json());
      const linked = users.find((u: any) => Number(u.studentId) === Number(student.id));
      if (linked) await fetch(`${API}/users/${linked.id}`, { method: 'DELETE' });

      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete student.');
    }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getClassName = (classId: number | null) =>
    classId ? classes.find(c => Number(c.id) === classId)?.name || '—' : '—';

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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-gray-900 dark:text-white">Manage Students</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              New students automatically get a login account created
            </p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['#', 'Name', 'Email', 'Class', 'DOB', 'Phone', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                        {search ? 'No students match your search.' : 'No students yet. Add your first student!'}
                      </td>
                    </tr>
                  ) : filtered.map(s => (
                    <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{s.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                            {s.avatar || s.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{s.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{getClassName(s.classId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{s.dateOfBirth || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{s.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => remove(s)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Showing {filtered.length} of {students.length} students
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-gray-900 dark:text-white">
                  {editingStudent ? 'Edit Student' : 'Add Student'}
                </h2>
                {!editingStudent && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    A user account will be auto-created (password: firstname123)
                  </p>
                )}
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Emma Johnson' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'e.g. emma@school.edu' },
                  { label: 'Date of Birth', key: 'dateOfBirth', type: 'date', placeholder: '' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+1234567890' },
                  { label: 'Enrollment Date', key: 'enrollmentDate', type: 'date', placeholder: '' },
                  { label: 'Parent ID', key: 'parentId', type: 'number', placeholder: 'e.g. 1' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                ))}

                {/* Address - full width */}
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input type="text" placeholder="e.g. 123 Main St"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                {/* Class select */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class</label>
                  <select value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">No class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Status select */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {['active', 'inactive', 'suspended'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview info box for new students */}
              {!editingStudent && form.name && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300 space-y-1">
                  <p className="font-medium">Auto-created account preview:</p>
                  <p>📧 Email: <strong>{form.email || '(enter email)'}</strong></p>
                  <p>🔑 Password: <strong>{form.name.trim().split(' ')[0].toLowerCase()}123</strong></p>
                  {form.classId && (
                    <p>🏫 Class: <strong>{classes.find(c => String(c.id) === form.classId)?.name}</strong></p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}