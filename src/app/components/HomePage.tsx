import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

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
              <button onClick={() => navigate('/')} className="text-blue-600">Home</button>
              <button onClick={() => navigate('/about')} className="text-gray-600 hover:text-blue-600 transition-colors">About</button>
              <button onClick={() => navigate('/services')} className="text-gray-600 hover:text-blue-600 transition-colors">Services</button>
              <button onClick={() => navigate('/resources')} className="text-gray-600 hover:text-blue-600 transition-colors">Resources</button>
              <button onClick={() => navigate('/team')} className="text-gray-600 hover:text-blue-600 transition-colors">Team</button>
              <button onClick={() => navigate('/news')} className="text-gray-600 hover:text-blue-600 transition-colors">News</button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-800 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
        <div className="HeaderCover text-center">
          <h1 className="text-5xl mb-6 text-blue-100 tracking-tight">
            Modern School Management System
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto mb-12">
            Streamline your educational institution with our comprehensive management platform. 
            Track students, manage teachers, and monitor performance all in one place.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-800 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg"
          >
            Get Started
          </button>
        </div>
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Features Section */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-gray-900">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your educational institution efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl mb-3 text-gray-900">Student Management</h3>
              <p className="text-gray-600">
                Comprehensive student tracking with detailed profiles, attendance records, and performance analytics.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl mb-3 text-gray-900">Teacher Portal</h3>
              <p className="text-gray-600">
                Dedicated dashboard for teachers to manage subjects, view schedules, and track student progress.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl mb-3 text-gray-900">Performance Analytics</h3>
              <p className="text-gray-600">
                Real-time insights and visualizations to help make data-driven decisions for better outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 mb-20">
          <div className="bg-gradient-to-r from-blue-800 to-green-800 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of educational institutions using EduManage
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                <span className="text-xl text-white">EduManage</span>
              </div>
              <p className="text-sm">Modern school management system for educational institutions.</p>
            </div>
            <div>
              <h3 className="text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => navigate('/resources')} className="hover:text-white transition-colors">Resources</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/team')} className="hover:text-white transition-colors">Our Team</button></li>
                <li><button onClick={() => navigate('/news')} className="hover:text-white transition-colors">News</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Register</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>© 2024 EduManage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}