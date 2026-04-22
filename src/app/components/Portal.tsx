import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

export default function Portal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Auto-redirect based on role
    switch (user.role) {
      case 'admin':
        navigate('/admin-dashboard', { replace: true });
        break;
      case 'teacher':
        navigate('/teacher-dashboard', { replace: true });
        break;
      case 'student':
        navigate('/student-dashboard', { replace: true });
        break;
      case 'parent':
        navigate('/parent-dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
