import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Users, Home, LogIn, LogOut, Moon, Sun, Menu, X, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  useEffect(() => {
    // Fetch notifications from API
    const fetchNotifications = async () => {
      // Replace with actual API call
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <header className="bg-blue-600 dark:bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <Users className="mr-2" /> CS Association
          </Link>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200 mr-4"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {user && (
              <div className="relative mr-4">
                <button
                  onClick={toggleNotification}
                  className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {isNotificationOpen && <NotificationDropdown notifications={notifications} />}
              </div>
            )}
            <button
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <nav className={`md:block ${isMenuOpen ? 'block' : 'hidden'} mt-4 md:mt-0`}>
          <ul className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
            <li>
              <Link to="/" className="hover:text-blue-200 flex items-center" onClick={toggleMenu}>
                <Home className="mr-1" size={18} /> Home
              </Link>
            </li>
            <li>
              <Link to="/members" className="hover:text-blue-200 flex items-center" onClick={toggleMenu}>
                <Users className="mr-1" size={18} /> Members
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-blue-200 flex items-center" onClick={toggleMenu}>
                <Calendar className="mr-1" size={18} /> Events
              </Link>
            </li>
            <li>
              <Link to="/forum" className="hover:text-blue-200 flex items-center" onClick={toggleMenu}>
                <MessageSquare className="mr-1" size={18} /> Forum
              </Link>
            </li>
            <li>
              <Link to="/projects" className="hover:text-blue-200 flex items-center" onClick={toggleMenu}>
                <Folder className="mr-1" size={18} /> Projects
              </Link>
            </li>
            <li>
              <Link to="/mentorship" className="hover:text-blue-200 flex items-center" onClick={toggleMenu}>
                <Users className="mr-1" size={18} /> Mentorship
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to={`/profile/${user.uid}`} className="hover:text-blue-200" onClick={toggleMenu}>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-blue-200" onClick={toggleMenu}>
                    Dashboard
                  </Link>
                </li>
                {user.isAdmin && (
                  <li>
                    <Link to="/admin" className="hover:text-blue-200" onClick={toggleMenu}>
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    className="hover:text-blue-200 flex items-center"
                  >
                    <LogOut className="mr-1" size={18} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="hover:text-blue-200 flex items-center" onClick={toggleMenu}>
                  <LogIn className="mr-1" size={18} /> Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;