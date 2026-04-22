import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Play, Clock, Loader, X } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description: string;
  duration: string;
  category: string;
  videoUrl: string;
  thumbnail: string;
}

export default function Resources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:3001/resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = selectedCategory === 'All'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

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
              <button onClick={() => navigate('/resources')} className="text-blue-600">Resources</button>
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
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-6 text-gray-900 tracking-tight">Learning Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch our comprehensive video tutorials to learn how to use EduManage effectively
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg transition-colors ${selectedCategory === category
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setActiveVideo(resource)}
                >
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {resource.duration}
                  </div>
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-3">
                    {resource.category}
                  </div>
                  <h3 className="text-xl mb-2 text-gray-900">{resource.title}</h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <button
                    onClick={() => setActiveVideo(resource)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                  >
                    Watch Video
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredResources.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No resources found in this category.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-2">
                  {activeVideo.category}
                </span>
                <h2 className="text-xl text-gray-900">{activeVideo.title}</h2>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="ml-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`${activeVideo.videoUrl}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
              <p className="text-gray-500 text-sm">{activeVideo.description}</p>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm flex-shrink-0 ml-4">
                <Clock className="w-4 h-4" />
                {activeVideo.duration}
              </div>
            </div>
          </div>
        </div>
      )}

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