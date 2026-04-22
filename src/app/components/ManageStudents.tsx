import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ArrowLeft, Plus, Edit2, Trash2, X, Save, Loader, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:3001';

interface Student {
  id: string;
  name: string;
  email: string;
  classId: number | null;
  parentId: number;
  dateOfBirth: string;
  address: string;
  phone: string;
  status: string;
  enrollmentDate: string;
  avatar: string;
  userId?: number | null;
}

interface ClassItem {
  id: string;
  name: string;
  grade: string;
  teacherId: number;
  studentIds: number[];
}

interface FormData {
  name: string;
  email: string;
  classId: string;
  parentId: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  status: string;
  enrollmentDate: string;
}

export default function ManageStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    classId: '',
    parentId: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch(`${API}/students`).then(r => r.json()),
        fetch(`${API}/classes`).then(r => r.json()),
      ]);
      setStudents(studentsRes);
      setClasses(classesRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Auto-create user account ──────────────────────────────────────────────
  const createUserAccount = async (name: string, email: string, studentId: string) => {
    // Default password = first name (lowercase) + '123'
    const firstName = name.trim().split(' ')[0].toLowerCase();
    const defaultPassword = `${firstName}123`;

    const payload = {
      email,
      password: defaultPassword,
      role: 'student',
      name,
      status: 'active',
      studentId: Number(studentId),
    };

    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  // ── Link student to class (add to studentIds + copy teacher/schedule) ─────
  const linkStudentToClass = async (studentId: string, classId: string) => {
    const cls = classes.find(c => String(c.id) === String(classId));
    if (!cls) return;

    // Add student to class's studentIds (avoid duplicates)
    const updatedIds = [...new Set([...(cls.studentIds || []), Number(studentId)])];
    await fetch(`${API}/classes/${classId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cls, studentIds: updatedIds }),
    });
  };

  // ── Remove student from old class ─────────────────────────────────────────
  const unlinkStudentFromClass = async (studentId: string, classId: number | null) => {
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
  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        classId: student.classId ? String(student.classId) : '',
        parentId: student.parentId ? String(student.parentId) : '',
        dateOfBirth: student.dateOfBirth || '',
        address: student.address || '',
        phone: student.phone || '',
        status: student.status || 'active',
        enrollmentDate: student.enrollmentDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        classId: '',
        parentId: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  // ── Save (Add or Edit) ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required.');
      return;
    }

    setSaving(true);
    try {
      const firstName = formData.name.trim().split(' ')[0];
      const avatar = formData.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

      const studentPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        classId: formData.classId ? Number(formData.classId) : null,
        parentId: formData.parentId ? Number(formData.parentId) : 0,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        phone: formData.phone,
        status: formData.status,
        enrollmentDate: formData.enrollmentDate,
        avatar,
      };

      if (editingStudent) {
        // ── EDIT existing student ──
        const oldClassId = editingStudent.classId;
        const newClassId = formData.classId;

        await fetch(`${API}/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...studentPayload, id: editingStudent.id }),
        });

        // If class changed, unlink from old and link to new
        if (String(oldClassId) !== String(newClassId)) {
          await unlinkStudentFromClass(editingStudent.id, oldClassId);
          if (newClassId) await linkStudentToClass(editingStudent.id, newClassId);
        }
      } else {
        // ── ADD new student ──
        const newStudentRes = await fetch(`${API}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentPayload),
        });
        const newStudent = await newStudentRes.json();

        // Auto-create user account with password = firstname123
        await createUserAccount(formData.name, formData.email, newStudent.id);

        // Link to class if selected
        if (formData.classId) {
          await linkStudentToClass(newStudent.id, formData.classId);
        }
      }

      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (student: Student) => {
    if (!confirm(`Delete ${student.name}? This will also remove their user account.`)) return;

    try {
      // Remove from class
      await unlinkStudentFromClass(student.id, student.classId);

      // Delete student
      await fetch(`${API}/students/${student.id}`, { method: 'DELETE' });

      // Delete linked user account
      const users = await fetch(`${API}/users`).then(r => r.json());
      const linkedUser = users.find((u: any) => Number(u.studentId) === Number(student.id));
      if (linkedUser) {
        await fetch(`${API}/users/${linkedUser.id}`, { method: 'DELETE' });
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student.');
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.id).includes(searchTerm)
  );

  const getClassName = (classId: number | null) =>
    classId ? classes.find(c => Number(c.id) === classId)?.name || '—' : '—';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Nav */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl text-gray-900 dark:text-white">EduManage</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-300 text-sm">Welcome, {user?.name}</span>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl text-gray-900 dark:text-white mb-1">Manage Students</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Add, edit, or remove students. New students automatically get a login account.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['ID', 'Name', 'Email', 'Class', 'Phone', 'Status', 'Enrolled', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400 text-sm">
                      {searchTerm ? 'No students match your search.' : 'No students yet. Add your first student!'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{student.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                            {student.avatar || student.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{getClassName(student.classId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>{student.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.enrollmentDate || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenModal(student)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          Showing {filteredStudents.length} of {students.length} students
        </p>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-gray-900 dark:text-white">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
                {!editingStudent && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    A login account will be created automatically (password: firstname123)
                  </p>
                )}
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Emma Johnson"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. emma@school.edu"
                  />
                </div>
              </div>

              {/* Class & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class</label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData(f => ({ ...f, classId: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Phone & DOB */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData(f => ({ ...f, dateOfBirth: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Enrollment Date */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Enrollment Date</label>
                <input
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={e => setFormData(f => ({ ...f, enrollmentDate: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 123 Main St"
                />
              </div>

              {/* Info box for new students */}
              {!editingStudent && formData.name && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p>✅ A user account will be created with:</p>
                  <p>📧 Email: <strong>{formData.email || '(enter email above)'}</strong></p>
                  <p>🔑 Password: <strong>{formData.name.trim().split(' ')[0].toLowerCase()}123</strong></p>
                  {formData.classId && (
                    <p>🏫 Class: <strong>{classes.find(c => c.id === formData.classId)?.name}</strong></p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-700 text-white rounded-xl text-sm hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}