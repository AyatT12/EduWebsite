import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Phone, Loader } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  bio: string;
  image: string;
}

export default function Team() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch('http://localhost:3001/team');
      const data = await response.json();
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <button onClick={() => navigate('/services')} className="text-gray-600 hover:text-blue-600 transition-colors">Services</button>
              <button onClick={() => navigate('/resources')} className="text-gray-600 hover:text-blue-600 transition-colors">Resources</button>
              <button onClick={() => navigate('/team')} className="text-blue-600">Team</button>
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
          <h1 className="text-5xl mb-6 text-gray-900 tracking-tight">Meet Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dedicated professionals committed to delivering excellence in education management
          </p>
        </div>

        {/* Team Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 mb-3">{member.position}</p>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{member.bio}</p>
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
