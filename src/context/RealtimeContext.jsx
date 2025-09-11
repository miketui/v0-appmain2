import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  useRealtimeMessages, 
  useRealtimePosts, 
  useRealtimeNotifications,
  useOnlinePresence 
} from '../hooks/useRealtimeSubscription';
import toast from 'react-hot-toast';

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  // Connection status tracking
  useEffect(() => {
    if (user) {
      setConnectionStatus('connecting');
      // Will be updated by individual subscription hooks
    } else {
      setConnectionStatus('disconnected');
    }
  }, [user]);

  // Real-time message handler
  const handleNewMessage = useCallback((message) => {
    // Only count messages not from current user
    if (message.sender_id !== user?.id) {
      setUnreadMessages(prev => prev + 1);
      
      // Show toast notification if not in chat
      if (!window.location.pathname.includes('/chat')) {
        toast.success(`New message from ${message.sender?.display_name || 'Someone'}`, {
          duration: 3000,
          onClick: () => {
            window.location.href = '/chat';
          }
        });
      }
      
      // Add to recent activity
      setRecentActivity(prev => [{
        id: message.id,
        type: 'message',
        title: 'New message',
        description: `From ${message.sender?.display_name || 'Someone'}`,
        timestamp: new Date(message.created_at),
        data: message
      }, ...prev.slice(0, 9)]); // Keep only last 10 activities
    }
  }, [user?.id]);

  // Real-time post handler
  const handleNewPost = useCallback((post) => {
    // Only show for posts from other users
    if (post.author_id !== user?.id) {
      // Add to recent activity
      setRecentActivity(prev => [{
        id: post.id,
        type: 'post',
        title: 'New post',
        description: `From ${post.author?.display_name || 'Someone'}`,
        timestamp: new Date(post.created_at),
        data: post
      }, ...prev.slice(0, 9)]);

      // Show toast if post is from same house
      if (post.house_id === userProfile?.house_id) {
        toast.success(`New post from ${post.author?.display_name || 'house member'}`, {
          duration: 3000,
          onClick: () => {
            window.location.href = '/';
          }
        });
      }
    }
  }, [user?.id, userProfile?.house_id]);

  // Real-time notification handler
  const handleNewNotification = useCallback((notification) => {
    setUnreadNotifications(prev => prev + 1);
    
    // Show toast notification
    toast.success(notification.title, {
      duration: 4000,
      onClick: () => {
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
      }
    });
    
    // Add to recent activity
    setRecentActivity(prev => [{
      id: notification.id,
      type: 'notification',
      title: notification.title,
      description: notification.message,
      timestamp: new Date(notification.created_at),
      data: notification
    }, ...prev.slice(0, 9)]);
  }, []);

  // Presence change handler
  const handlePresenceChange = useCallback((presenceState) => {
    setOnlineUsers(presenceState);
    setConnectionStatus('connected');
  }, []);

  // Set up real-time subscriptions
  const messagesSubscription = useRealtimeMessages(
    userProfile?.id ? 'all' : null, // Subscribe to all messages for the user
    handleNewMessage
  );

  const postsSubscription = useRealtimePosts(handleNewPost);

  const notificationsSubscription = useRealtimeNotifications(
    userProfile?.id,
    handleNewNotification
  );

  const presenceSubscription = useOnlinePresence(
    userProfile?.id,
    handlePresenceChange
  );

  // Update connection status based on subscriptions
  useEffect(() => {
    if (userProfile?.id) {
      const anyConnected = [
        messagesSubscription.connected,
        postsSubscription.connected,
        notificationsSubscription.connected
      ].some(Boolean);

      const anyError = [
        messagesSubscription.error,
        postsSubscription.error,
        notificationsSubscription.error
      ].some(Boolean);

      if (anyError) {
        setConnectionStatus('error');
      } else if (anyConnected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('connecting');
      }
    }
  }, [
    messagesSubscription.connected,
    messagesSubscription.error,
    postsSubscription.connected,
    postsSubscription.error,
    notificationsSubscription.connected,
    notificationsSubscription.error,
    userProfile?.id
  ]);

  // Functions to manage unread counts
  const markMessagesAsRead = useCallback((count = null) => {
    if (count !== null) {
      setUnreadMessages(prev => Math.max(0, prev - count));
    } else {
      setUnreadMessages(0);
    }
  }, []);

  const markNotificationsAsRead = useCallback((count = null) => {
    if (count !== null) {
      setUnreadNotifications(prev => Math.max(0, prev - count));
    } else {
      setUnreadNotifications(0);
    }
  }, []);

  const clearRecentActivity = useCallback(() => {
    setRecentActivity([]);
  }, []);

  // Reconnect function
  const reconnect = useCallback(() => {
    setConnectionStatus('connecting');
    messagesSubscription.reconnect();
    postsSubscription.reconnect();
    notificationsSubscription.reconnect();
  }, [messagesSubscription, postsSubscription, notificationsSubscription]);

  // Connection status indicator
  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'green', text: 'Connected', pulse: false };
      case 'connecting':
        return { color: 'yellow', text: 'Connecting...', pulse: true };
      case 'error':
        return { color: 'red', text: 'Connection Error', pulse: false };
      case 'disconnected':
      default:
        return { color: 'gray', text: 'Disconnected', pulse: false };
    }
  };

  const value = {
    // Connection status
    connectionStatus,
    connectionStatusInfo: getConnectionStatusInfo(),
    
    // Unread counts
    unreadMessages,
    unreadNotifications,
    totalUnread: unreadMessages + unreadNotifications,
    
    // Online presence
    onlineUsers,
    isUserOnline: (userId) => Object.keys(onlineUsers).includes(userId),
    
    // Recent activity
    recentActivity,
    
    // Functions
    markMessagesAsRead,
    markNotificationsAsRead,
    clearRecentActivity,
    reconnect,
    
    // Subscription status
    subscriptions: {
      messages: {
        connected: messagesSubscription.connected,
        error: messagesSubscription.error
      },
      posts: {
        connected: postsSubscription.connected,
        error: postsSubscription.error
      },
      notifications: {
        connected: notificationsSubscription.connected,
        error: notificationsSubscription.error
      }
    }
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeContext;