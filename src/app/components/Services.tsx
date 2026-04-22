import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, TrendingUp, Calendar, MessageSquare, FileText, Shield } from 'lucide-react';

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student database with profiles, attendance, grades, and performance tracking.',
      features: ['Digital student records', 'Attendance tracking', 'Grade management', 'Performance analytics']
    },
    {
      icon: BookOpen,
      title: 'Teacher Portal',
      description: 'Dedicated dashboard for teachers to manage classes, subjects, and student progress.',
      features: ['Class scheduling', 'Subject management', 'Assignment tracking', 'Student communication']
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Reporting',
      description: 'Advanced reporting tools with real-time insights and visual dashboards.',
      features: ['Custom reports', 'Performance trends', 'Comparative analysis', 'Export capabilities']
    },
    {
      icon: Calendar,
      title: 'Schedule Management',
      description: 'Integrated calendar system for managing classes, events, and important dates.',
      features: ['Automated scheduling', 'Event notifications', 'Resource booking', 'Conflict detection']
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'Centralized communication platform for teachers, students, and parents.',
      features: ['In-app messaging', 'Announcements', 'Email integration', 'Notification system']
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Secure storage and organization for all educational documents and resources.',
      features: ['Cloud storage', 'Version control', 'Access permissions', 'Quick search']
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Enterprise-grade security measures to protect sensitive educational data.',
      features: ['Data encryption', 'Role-based access', 'Audit logs', 'GDPR compliant']
    },
    {
      icon: Users,
      title: 'Parent Portal',
      description: 'Keep parents informed with real-time access to their children\'s progress.',
      features: ['Progress tracking', 'Attendance reports', 'Grade viewing', 'Teacher communication']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-2xl tracking-tight text-gray-900">EduManage</span>
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-blue-600 transition-colors">Home</button>
              <button onClick={() => navigate('/about')} className="text-gray-600 hover:text-blue-600 transition-colors">About</button>
              <button onClick={() => navigate('/services')} className="text-blue-600">Services</button>
              <button onClick={() => navigate('/resources')} className="text-gray-600 hover:text-blue-600 transition-colors">Resources</button>
              <button onClick={() => navigate('/team')} className="text-gray-600 hover:text-blue-600 transition-colors">Team</button>
              <button onClick={() => navigate('/news')} className="text-gray-600 hover:text-blue-600 transition-colors">News</button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl mb-6 text-gray-900 tracking-tight">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive solutions designed to streamline every aspect of school management and enhance the educational experience.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border  hover:shadow-md transition-shadow  border-2 border-dashed border-gray-400">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl mb-3 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-800 to-green-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl mb-4">Ready to Transform Your School?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join thousands of educational institutions already using EduManage
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <span className="text-xl text-white">EduManage</span>
          </div>
          <p>© 2024 EduManage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
