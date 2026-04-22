import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GraduationCap, Calendar, User, Tag, ArrowLeft, Loader } from 'lucide-react';

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

export default function NewsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:3001/news/${id}`);
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Article not found</p>
          <button
            onClick={() => navigate('/news')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/news')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to News
        </button>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm mb-4">
                <Tag className="w-3 h-3 text-blue-600" />
                {article.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <h1 className="text-4xl mb-6 text-gray-900">{article.title}</h1>
            
            <div className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(article.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{article.author}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">{article.excerpt}</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{article.content}</p>
            </div>
          </div>
        </article>

        {/* Related News CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/news')}
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors"
          >
            View More News
            <ArrowLeft className="w-5 h-5 rotate-180" />
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
