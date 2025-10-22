import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { USER_ROLES, USER_ROLE_LABELS } from '../utils/constants';
import { getInitials, cn } from '../utils/helpers';


// Header component for the main application layout - Includes navigation, user menu, and notifications
const Header = ({ onMenuToggle, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const isJudge = authService.isJudge();

  // Handle user logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Navigate to user profile
  const handleProfile = () => {
    navigate('/profile');
    setIsUserMenuOpen(false);
  };

  // Navigate to settings
  const handleSettings = () => {
    navigate('/settings');
    setIsUserMenuOpen(false);
  };

  // Get user's display name
  const getDisplayName = () => {
    return user?.username || user?.email || 'User';
  };

// Get user's role label
  const getRoleLabel = () => {
    return USER_ROLE_LABELS[user?.role] || 'User';
  };

  return (
    <header className="akademia-header">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu toggle and logo */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 lg:hidden"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center ml-4 lg:ml-0">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">
                Student Project Marking
              </h1>
            </div>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <Bell className="h-6 w-6" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">
                      New team has been registered
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      2 minutes ago
                    </p>
                  </div>
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">
                      Round 1 has been closed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      1 hour ago
                    </p>
                  </div>
                  <div className="p-4 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">
                      Judge assignment completed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      3 hours ago
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="text-sm text-akademia-primary hover:text-akademia-secondary">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {/* User avatar */}
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {getInitials(getDisplayName())}
                </span>
              </div>
              
              {/* User info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-white/80">
                  {getRoleLabel()}
                </p>
              </div>
              
              <ChevronDown className="h-4 w-4 text-white/80" />
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                  <p className="text-xs text-akademia-primary mt-1">
                    {getRoleLabel()}
                  </p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={handleProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </button>
                  
                  <button
                    onClick={handleSettings}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;