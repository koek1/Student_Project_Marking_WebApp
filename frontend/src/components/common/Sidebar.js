import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  Calendar,
  Award,
  BarChart3,
  Settings,
  UserPlus,
  UserCheck,
  FileText,
  Clock,
  Trophy
} from 'lucide-react';
import authService from '../services/auth';
import { USER_ROLES } from '../utils/constants';
import { cn } from '../utils/helpers';

// Sidebar component for navigation - Shows different menu items based on user role

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isAdmin = authService.isAdmin();
  const isJudge = authService.isJudge();

  // Navigation items for admin

  const adminNavItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and statistics'
    },
    {
      name: 'Teams',
      href: '/admin/teams',
      icon: Users,
      description: 'Manage project teams'
    },
    {
      name: 'Criteria',
      href: '/admin/criteria',
      icon: Target,
      description: 'Evaluation criteria'
    },
    {
      name: 'Rounds',
      href: '/admin/rounds',
      icon: Calendar,
      description: 'Evaluation rounds'
    },
    {
      name: 'Judge Assignment',
      href: '/admin/assignment',
      icon: UserCheck,
      description: 'Assign judges to teams'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UserPlus,
      description: 'Manage users'
    },
    {
      name: 'Results',
      href: '/admin/results',
      icon: Trophy,
      description: 'View results and winners'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Detailed analytics'
    }
  ];

  // Navigation items for judge

  const judgeNavItems = [
    {
      name: 'Dashboard',
      href: '/judge/dashboard',
      icon: LayoutDashboard,
      description: 'Your assigned teams'
    },
    {
      name: 'My Teams',
      href: '/judge/teams',
      icon: Users,
      description: 'Teams assigned to you'
    },
    {
      name: 'Score Teams',
      href: '/judge/scoring',
      icon: FileText,
      description: 'Score your assigned teams'
    },
    {
      name: 'Score History',
      href: '/judge/history',
      icon: Clock,
      description: 'View scoring history'
    }
  ];

// Get navigation items based on user role

  const getNavItems = () => {
    if (isAdmin) return adminNavItems;
    if (isJudge) return judgeNavItems;
    return [];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-akademia-primary">
              Navigation
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'akademia-sidebar-item group',
                    isActive && 'akademia-sidebar-item active'
                  )}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-akademia-primary rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Settings
                </p>
                <p className="text-xs text-gray-500">
                  Application settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;