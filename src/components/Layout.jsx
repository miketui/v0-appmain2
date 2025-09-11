import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, className = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, signOut } = useAuth();

  const handleSearch = (query) => {
    console.log('Search:', query);
    // Handle global search
  };

  const handleSearchResultSelect = (result) => {
    console.log('Search result selected:', result);
    // Handle search result selection
  };

  const handleUserMenuClick = () => {
    // Toggle user menu or navigate to profile
    console.log('User menu clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed inset-y-0 left-0 z-50 lg:static lg:z-auto"
      />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Mobile menu button and search */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search bar */}
              <div className="flex-1 max-w-lg">
                <SearchBar
                  onSearch={handleSearch}
                  onResultSelect={handleSearchResultSelect}
                  placeholder="Search..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Right side - Notifications and user menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={handleUserMenuClick}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UserAvatar 
                    user={userProfile} 
                    size="sm" 
                    showHouseIndicator={true}
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.display_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userProfile?.house?.name || userProfile?.role}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={`${className}`}>
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* About */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  About
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                      Our Story
                    </a>
                  </li>
                  <li>
                    <a href="/community" className="text-sm text-gray-600 hover:text-gray-900">
                      Community
                    </a>
                  </li>
                  <li>
                    <a href="/houses" className="text-sm text-gray-600 hover:text-gray-900">
                      Houses
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Support
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="/guidelines" className="text-sm text-gray-600 hover:text-gray-900">
                      Guidelines
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Legal
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/code-of-conduct" className="text-sm text-gray-600 hover:text-gray-900">
                      Code of Conduct
                    </a>
                  </li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Connect
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                      TikTok
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Haus of Basquiat
                  </h2>
                  <span className="text-sm text-gray-500">
                    Building community, celebrating art
                  </span>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <p className="text-sm text-gray-500">
                    © 2024 Haus of Basquiat. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;