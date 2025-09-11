import React from 'react';
import { User, Crown, Shield, Star } from 'lucide-react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  showHouseIndicator = false,
  showOnlineStatus = false,
  showRoleIndicator = false,
  className = '',
  onClick = null
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    xxl: 'w-20 h-20 text-2xl'
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28
  };

  // Get user initials for fallback
  const getInitials = (displayName, email) => {
    if (displayName) {
      return displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get role indicator
  const getRoleIndicator = () => {
    if (!showRoleIndicator || !user?.role) return null;

    const roleConfig = {
      Admin: { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100' },
      Leader: { icon: Shield, color: 'text-purple-500', bg: 'bg-purple-100' },
      Member: { icon: Star, color: 'text-blue-500', bg: 'bg-blue-100' }
    };

    const config = roleConfig[user.role];
    if (!config) return null;

    const Icon = config.icon;
    const iconSize = size === 'xs' || size === 'sm' ? 10 : 12;

    return (
      <div className={`absolute -bottom-1 -right-1 ${config.bg} rounded-full p-1`}>
        <Icon className={`${config.color}`} size={iconSize} />
      </div>
    );
  };

  // Get house color for border
  const getHouseBorderColor = () => {
    if (!showHouseIndicator || !user?.house) return 'border-gray-200';
    
    // House-specific colors (you can customize these)
    const houseColors = {
      'House of Aviance': 'border-red-400',
      'House of Mizrahi': 'border-blue-400',
      'House of Labeija': 'border-green-400',
      'House of Pendavis': 'border-purple-400',
      'House of Xtravaganza': 'border-yellow-400',
      'House of Ninja': 'border-pink-400'
    };

    return houseColors[user.house.name] || 'border-indigo-400';
  };

  // Generate background color based on user name
  const getBackgroundColor = () => {
    if (!user) return 'bg-gray-400';
    
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
      'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400'
    ];
    
    const name = user.display_name || user.email || 'User';
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const avatarElement = (
    <div 
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} rounded-full border-2 ${getHouseBorderColor()} ${getBackgroundColor()} ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.display_name || user.email || 'User avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="font-medium text-white">
          {getInitials(user?.display_name, user?.email)}
        </span>
      )}

      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <div className="w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
      )}

      {/* Role indicator */}
      {getRoleIndicator()}

      {/* House indicator tooltip */}
      {showHouseIndicator && user?.house && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {user.house.name}
        </div>
      )}
    </div>
  );

  // Wrap with group class for hover effects if showing house indicator
  if (showHouseIndicator && user?.house) {
    return <div className="group relative">{avatarElement}</div>;
  }

  return avatarElement;
};

export default UserAvatar;