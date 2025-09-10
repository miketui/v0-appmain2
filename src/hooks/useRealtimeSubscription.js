import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Hook for managing Supabase real-time subscriptions
 */
export const useRealtimeSubscription = (
  table,
  filter = {},
  callback,
  options = {}
) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const {
    event = '*', // INSERT, UPDATE, DELETE, or *
    schema = 'public',
    immediate = true,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const subscribe = useCallback(() => {
    if (!supabaseClient) {
      const error = new Error('Supabase client not initialized. Check environment variables.');
      setError(error);
      onError && onError(error);
      return;
    }

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    try {
      let subscription = supabaseClient
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event,
            schema,
            table,
            filter: Object.keys(filter).length > 0 ? 
              Object.entries(filter).map(([key, value]) => `${key}=eq.${value}`).join(',') : 
              undefined
          },
          (payload) => {
            if (callbackRef.current) {
              callbackRef.current(payload);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Real-time subscription status for ${table}:`, status);
          
          if (status === 'SUBSCRIBED') {
            setConnected(true);
            setError(null);
            onConnect && onConnect();
          } else if (status === 'CHANNEL_ERROR') {
            const error = new Error(`Failed to subscribe to ${table} changes`);
            setError(error);
            setConnected(false);
            onError && onError(error);
          } else if (status === 'TIMED_OUT') {
            const error = new Error(`Subscription to ${table} timed out`);
            setError(error);
            setConnected(false);
            onError && onError(error);
          } else if (status === 'CLOSED') {
            setConnected(false);
            onDisconnect && onDisconnect();
          }
        });

      subscriptionRef.current = subscription;
    } catch (err) {
      console.error('Real-time subscription error:', err);
      setError(err);
      onError && onError(err);
    }
  }, [table, event, schema, filter, onConnect, onDisconnect, onError]);

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
      setConnected(false);
    }
  }, []);

  // Auto-subscribe on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [immediate, subscribe, unsubscribe]);

  return {
    connected,
    error,
    subscribe,
    unsubscribe,
    reconnect: subscribe
  };
};

/**
 * Hook for subscribing to multiple tables
 */
export const useMultipleRealtimeSubscriptions = (subscriptions = []) => {
  const [connections, setConnections] = useState({});
  const [errors, setErrors] = useState({});
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(sub => {
      if (sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    subscriptionsRef.current = [];

    // Create new subscriptions
    subscriptions.forEach(({ id, table, filter, callback, options }) => {
      const subscription = useRealtimeSubscription(
        table,
        filter,
        callback,
        {
          ...options,
          immediate: false,
          onConnect: () => {
            setConnections(prev => ({ ...prev, [id]: true }));
          },
          onDisconnect: () => {
            setConnections(prev => ({ ...prev, [id]: false }));
          },
          onError: (error) => {
            setErrors(prev => ({ ...prev, [id]: error }));
          }
        }
      );

      subscription.subscribe();
      subscriptionsRef.current.push(subscription);
    });

    return () => {
      subscriptionsRef.current.forEach(sub => {
        if (sub.unsubscribe) {
          sub.unsubscribe();
        }
      });
    };
  }, [subscriptions]);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(sub => {
      if (sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    setConnections({});
    setErrors({});
  }, []);

  return {
    connections,
    errors,
    unsubscribeAll
  };
};

/**
 * Specific hooks for common real-time subscriptions
 */

// Messages real-time
export const useRealtimeMessages = (threadId, onMessage) => {
  return useRealtimeSubscription(
    'messages',
    { thread_id: threadId },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        onMessage && onMessage(payload.new);
      }
    },
    { 
      event: 'INSERT',
      immediate: !!threadId && !!onMessage 
    }
  );
};

// Posts real-time
export const useRealtimePosts = (onPost) => {
  return useRealtimeSubscription(
    'posts',
    {},
    (payload) => {
      if (payload.eventType === 'INSERT' && payload.new.moderation_status === 'approved') {
        onPost && onPost(payload.new);
      }
    },
    { 
      event: 'INSERT',
      immediate: !!onPost 
    }
  );
};

// Notifications real-time
export const useRealtimeNotifications = (userId, onNotification) => {
  return useRealtimeSubscription(
    'notifications',
    { user_id: userId },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        onNotification && onNotification(payload.new);
      }
    },
    {
      event: 'INSERT',
      immediate: !!userId && !!onNotification
    }
  );
};

// Online presence
export const useOnlinePresence = (userId, onPresenceChange) => {
  const [presenceState, setPresenceState] = useState({});
  const channelRef = useRef(null);

  useEffect(() => {
    if (!supabaseClient || !userId) return;

    const channel = supabaseClient.channel('online-users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        setPresenceState(newState);
        onPresenceChange && onPresenceChange(newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [userId, onPresenceChange]);

  const updatePresence = useCallback((data) => {
    if (channelRef.current) {
      channelRef.current.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        ...data
      });
    }
  }, [userId]);

  return {
    presenceState,
    updatePresence,
    isOnline: (checkUserId) => {
      return Object.keys(presenceState).includes(checkUserId);
    }
  };
};

export default useRealtimeSubscription;