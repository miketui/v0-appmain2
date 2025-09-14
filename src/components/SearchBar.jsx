import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, FileText, MessageSquare, Hash } from 'lucide-react';
import UserAvatar from './UserAvatar';

const SearchBar = ({ 
  onSearch, 
  onResultSelect,
  placeholder = "Search users, posts, documents...",
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('haus-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await performSearch(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery) => {
    // This would be replaced with actual API call
    const mockResults = [
      {
        type: 'user',
        id: '1',
        title: 'Alex Rivera',
        subtitle: 'House of Mizrahi • Member',
        avatar_url: null,
        house: { name: 'House of Mizrahi' },
        role: 'Member'
      },
      {
        type: 'post',
        id: '2',
        title: 'Amazing performance at the ball last night!',
        subtitle: 'Posted 2 hours ago • 15 likes',
        author: 'Jordan Blake'
      },
      {
        type: 'document',
        id: '3',
        title: 'Community Guidelines 2024',
        subtitle: 'PDF • House Leaders only',
        file_type: 'application/pdf'
      },
      {
        type: 'hashtag',
        id: '4',
        title: '#BallroomLife',
        subtitle: '142 posts'
      }
    ];

    // Filter based on query
    return mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleResultClick = (result) => {
    addToRecentSearches(result);
    onResultSelect && onResultSelect(result);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle search submission
  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    const searchResult = {
      type: 'search',
      query: searchQuery.trim(),
      title: searchQuery.trim()
    };
    
    addToRecentSearches(searchResult);
    onSearch && onSearch(searchQuery.trim());
    setIsOpen(false);
  };

  // Add to recent searches
  const addToRecentSearches = (item) => {
    const updated = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('haus-recent-searches', JSON.stringify(updated));
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('haus-recent-searches');
  };

  // Get result icon
  const getResultIcon = (result) => {
    switch (result.type) {
      case 'user':
        return <UserAvatar user={result} size="sm" />;
      case 'post':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'hashtag':
        return <Hash className="w-5 h-5 text-purple-500" />;
      default:
        return <Search className="w-5 h-5 text-gray-400" />;
    }
  };

  // Render result item
  const renderResult = (result, index) => {
    const isSelected = index === selectedIndex;
    
    return (
      <button
        key={`${result.type}-${result.id}`}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-purple-50' : ''
        }`}
        onClick={() => handleResultClick(result)}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        <div className="flex-shrink-0">
          {getResultIcon(result)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {result.title}
          </p>
          {result.subtitle && (
            <p className="text-xs text-gray-500 truncate">
              {result.subtitle}
            </p>
          )}
        </div>
      </button>
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          role="searchbox"
          aria-label="Search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : query.trim().length < 2 ? (
            <div className="p-4">
              {recentSearches.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Recent searches</h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((item, index) => renderResult(item, index))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Start typing to search...
                </p>
              )}
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => renderResult(result, index))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700"
              >
                Search for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
