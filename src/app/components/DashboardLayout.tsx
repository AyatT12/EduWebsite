import { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, LogOut, Menu, X, Sun, Moon, Bell, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  role: string;
  accentColor?: string;
}

const roleColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  admin: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  teacher: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  student: { bg: 'bg-blue-700', text: 'text-blue-600', border: 'border-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  parent: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export default function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const colors = roleColors[role] || roleColors.admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarInitials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700 ${!sidebarOpen ? 'justify-center' : ''}`}>
        <div className={`w-9 h-9 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <p className="text-gray-900 dark:text-white leading-none">EduManage</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{role} Portal</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? `${colors.bg} text-white shadow-sm`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
              {sidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* User Card */}
      <div className={`px-3 py-4 border-t border-gray-200 dark:border-gray-700`}>
        <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
          <div className={`w-9 h-9 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs`}>
            {avatarInitials}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} capitalize`}>{role}</span>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden`}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-gray-800 h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSidebarOpen(p => !p); setMobileOpen(p => !p); }}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-gray-900 dark:text-white capitalize">{role} Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Bell */}
            <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2">
              <div className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center text-white text-xs`}>
                {avatarInitials}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
