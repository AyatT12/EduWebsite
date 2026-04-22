import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Award, Target, Heart, Lightbulb } from 'lucide-react';

export default function About() {
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
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-blue-600 transition-colors">Home</button>
              <button onClick={() => navigate('/about')} className="text-blue-600">About</button>
              <button onClick={() => navigate('/services')} className="text-gray-600 hover:text-blue-600 transition-colors">Services</button>
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
          <h1 className="text-5xl mb-6 text-gray-900 tracking-tight">About EduManage</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering educational institutions with innovative technology solutions to create better learning environments and outcomes.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-2 border-dashed border-gray-400">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl mb-4 text-gray-900">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize education management by providing intuitive, comprehensive, and efficient tools that enable educators to focus on what matters most - nurturing young minds and fostering academic excellence.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-2 border-dashed border-gray-400">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl mb-4 text-gray-900">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the leading education management platform globally, recognized for innovation, reliability, and positive impact on educational institutions of all sizes, creating a connected ecosystem for learning.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="text-4xl text-center mb-12 text-gray-900">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl mb-3 text-gray-900">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from product development to customer support.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl mb-3 text-gray-900">Collaboration</h3>
              <p className="text-gray-600">
                We believe in the power of collaboration between educators, students, and technology.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl mb-3 text-gray-900">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate to stay ahead of educational trends and technological advances.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-12 rounded-2xl border border-blue-200">
          <h2 className="text-4xl text-center mb-12 text-gray-900">Why Choose EduManage?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl mb-2 text-gray-900">Comprehensive Student Management</h3>
                <p className="text-gray-600">
                  Track student progress, attendance, grades, and performance with detailed analytics and reporting tools.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl mb-2 text-gray-900">Teacher Portal</h3>
                <p className="text-gray-600">
                  Dedicated tools for teachers to manage classes, subjects, and student interactions efficiently.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl mb-2 text-gray-900">Performance Analytics</h3>
                <p className="text-gray-600">
                  Real-time insights and visualizations to make data-driven decisions for improved outcomes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl mb-2 text-gray-900">Easy to Use</h3>
                <p className="text-gray-600">
                  Intuitive interface designed for users of all technical skill levels with comprehensive support.
                </p>
              </div>
            </div>
          </div>
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
