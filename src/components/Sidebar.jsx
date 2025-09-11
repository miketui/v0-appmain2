import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Crown,
  Calendar,
  Camera,
  Award,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import UserAvatar from './UserAvatar';

const Sidebar = ({ isOpen, onClose, className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const permissions = usePermissions();

  // Navigation items based on user permissions
  const getNavigationItems = () => {
    const items = [
      {
        name: 'Feed',
        href: '/',
        icon: Home,
        description: 'Community posts and updates',
        show: permissions.canPost
      },
      {
        name: 'Messages',
        href: '/chat',
        icon: MessageSquare,
        description: 'Direct messages and group chats',
        show: permissions.canChat
      },
      {
        name: 'Library',
        href: '/docs',
        icon: FileText,
        description: 'Documents and resources',
        show: permissions.canViewDocs
      },
      {
        name: 'Events',
        href: '/events',
        icon: Calendar,
        description: 'Upcoming balls and workshops',
        show: permissions.isMemberOrAbove
      },
      {
        name: 'Gallery',
        href: '/gallery',
        icon: Camera,
        description: 'Photo and video gallery',
        show: permissions.isMemberOrAbove
      }
    ];

    // Admin items
    if (permissions.isAdmin) {
      items.push(
        {
          name: 'Admin',
          href: '/admin',
          icon: Crown,
          description: 'User and system management',
          show: true
        }
      );
    }

    // Settings always visible
    items.push({
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account and preferences',
      show: true
    });

    return items.filter(item => item.show);
  };

  // House sections for members
  const getHouseSections = () => {
    if (!userProfile?.house || !permissions.isMemberOrAbove) return [];

    return [
      {
        name: 'House Feed',
        href: `/houses/${userProfile.house.id}/feed`,
        description: 'Posts from house members'
      },
      {
        name: 'House Events',
        href: `/houses/${userProfile.house.id}/events`,
        description: 'House-specific events'
      },
      {
        name: 'House Members',
        href: `/houses/${userProfile.house.id}/members`,
        description: 'View house roster'
      }
    ];
  };

  const navigationItems = getNavigationItems();
  const houseSections = getHouseSections();

  const handleNavigation = (href) => {
    navigate(href);
    onClose && onClose(); // Close mobile sidebar
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`${className} ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white border-r border-gray-200 flex flex-col h-full`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              Haus of Basquiat
            </h1>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <UserAvatar 
              user={userProfile} 
              size="md" 
              showHouseIndicator={true}
              showRoleIndicator={true}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.display_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile?.house?.name || userProfile?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main navigation */}
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={item.description}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* House Section */}
          {houseSections.length > 0 && (
            <div className="pt-6">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {userProfile.house.name}
                </h3>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="space-y-1">
                {houseSections.map((section) => (
                  <button
                    key={section.name}
                    onClick={() => handleNavigation(section.href)}
                    className={`w-full flex items-center px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ${
                      isActive(section.href) ? 'bg-gray-100 text-gray-900' : ''
                    }`}
                    title={section.description}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-6">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigation('/create-post')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="mr-3 h-5 w-5 text-center">+</span>
                New Post
              </button>
              
              {permissions.canUploadDocs && (
                <button
                  onClick={() => handleNavigation('/upload-document')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FileText className="mr-3 h-5 w-5" />
                  Upload Document
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;