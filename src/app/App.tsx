import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Portal from './components/Portal';
import About from './components/About';
import Services from './components/Services';
import Resources from './components/Resources';
import Team from './components/Team';
import News from './components/News';
import NewsDetail from './components/NewsDetail';

// Role Dashboards
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ParentDashboard from './components/ParentDashboard';

// Admin Management Pages
import ManageStudentsAdmin from './components/admin/ManageStudentsAdmin';
import ManageTeachersAdmin from './components/admin/ManageTeachersAdmin';
import ManageUsersAdmin from './components/admin/ManageUsersAdmin';
import ManageClassesAdmin from './components/admin/ManageClassesAdmin';
import ManageSubjectsAdmin from './components/admin/ManageSubjectsAdmin';
import ManageParentsAdmin from './components/admin/ManageParentsAdmin';
import AdminReports from './components/admin/AdminReports';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/team" element={<Team />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />

            {/* Portal Redirect */}
            <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><ManageStudentsAdmin /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute><ManageTeachersAdmin /></ProtectedRoute>} />
            <Route path="/admin/parents" element={<ProtectedRoute><ManageParentsAdmin /></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute><ManageClassesAdmin /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute><ManageSubjectsAdmin /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><ManageUsersAdmin /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />

            {/* Teacher Routes */}
            <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

            {/* Parent Routes */}
            <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
