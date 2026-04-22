import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Plus, Edit2, Trash2, X, Save, Loader, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  students: number;
  experience: number;
  classes: number;
}

interface TeacherFormData {
  name: string;
  subject: string;
  students: string;
  experience: string;
  classes: string;
}

export default function ManageTeachers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    subject: '',
    students: '',
    experience: '',
    classes: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<TeacherFormData>>({});

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://localhost:3001/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<TeacherFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    const students = parseInt(formData.students);
    if (!formData.students || isNaN(students) || students < 0) {
      errors.students = 'Number of students must be a positive number';
    }
    
    const experience = parseInt(formData.experience);
    if (!formData.experience || isNaN(experience) || experience < 0) {
      errors.experience = 'Experience must be a positive number';
    }
    
    const classes = parseInt(formData.classes);
    if (!formData.classes || isNaN(classes) || classes < 0) {
      errors.classes = 'Number of classes must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        subject: teacher.subject,
        students: teacher.students.toString(),
        experience: teacher.experience.toString(),
        classes: teacher.classes.toString()
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: '',
        subject: '',
        students: '',
        experience: '',
        classes: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: '',
      subject: '',
      students: '',
      experience: '',
      classes: ''
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const teacherData = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      students: parseInt(formData.students),
      experience: parseInt(formData.experience),
      classes: parseInt(formData.classes)
    };

    try {
      if (editingTeacher) {
        // Update existing teacher
        await fetch(`http://localhost:3001/teachers/${editingTeacher.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...teacherData, id: editingTeacher.id }),
        });
      } else {
        // Add new teacher
        const newId = `T${String(teachers.length + 1).padStart(3, '0')}`;
        await fetch('http://localhost:3001/teachers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...teacherData, id: newId }),
        });
      }
      
      fetchTeachers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Failed to save teacher. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      await fetch(`http://localhost:3001/teachers/${id}`, {
        method: 'DELETE',
      });
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Failed to delete teacher. Please try again.');
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-2xl tracking-tight text-gray-900">EduManage</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button 
                onClick={() => navigate('/teacher-dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-gray-900 mb-2">Manage Teachers</h1>
          <p className="text-gray-600 text-lg">Add, edit, or remove faculty records</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers by name, ID, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Teacher
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600">ID</th>
                  <th className="px-6 py-3 text-left text-gray-600">Name</th>
                  <th className="px-6 py-3 text-left text-gray-600">Subject</th>
                  <th className="px-6 py-3 text-left text-gray-600">Students</th>
                  <th className="px-6 py-3 text-left text-gray-600">Experience</th>
                  <th className="px-6 py-3 text-left text-gray-600">Classes</th>
                  <th className="px-6 py-3 text-right text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No teachers found matching your search.' : 'No teachers found. Add your first teacher!'}
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{teacher.id}</td>
                      <td className="px-6 py-4 text-gray-900">{teacher.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                          {teacher.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{teacher.students}</td>
                      <td className="px-6 py-4 text-gray-900">{teacher.experience} years</td>
                      <td className="px-6 py-4 text-gray-900">{teacher.classes}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(teacher)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit teacher"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete teacher"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Results Count */}
        <div className="mt-4 text-gray-600 text-center">
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl text-gray-900">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter teacher name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Mathematics, Physics"
                  />
                  {formErrors.subject && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Number of Students *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.students ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Total students taught"
                  />
                  {formErrors.students && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.students}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Experience (years) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Years of teaching experience"
                  />
                  {formErrors.experience && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Number of Classes *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.classes}
                    onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.classes ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Number of classes taught"
                  />
                  {formErrors.classes && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.classes}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingTeacher ? 'Update' : 'Add'} Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
