import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Calendar, User, Tag, Loader, ArrowRight } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
}

export default function News() {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('http://localhost:3001/news');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(news.map(n => n.category)))];

  const filteredNews = selectedCategory === 'All'
    ? news
    : news.filter(n => n.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
              <button onClick={() => navigate('/team')} className="text-gray-600 hover:text-blue-600 transition-colors">Team</button>
              <button onClick={() => navigate('/news')} className="text-blue-600">News</button>
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
          <h1 className="text-5xl mb-6 text-gray-900 tracking-tight">Latest News</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest announcements, events, and achievements
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/news/${article.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-blue-700">
                      <Tag className="w-3 h-3 text-blue-600" />
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(article.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {article.author}
                    </div>
                  </div>
                  <h3 className="text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center text-blue-600 group-hover:gap-2 transition-all">
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredNews.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No news found in this category.</p>
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
