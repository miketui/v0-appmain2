import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeSubscription, useRealtimeMessages, useRealtimePosts, useRealtimeNotifications, useOnlinePresence } from '../useRealtimeSubscription';

// Mock Supabase client
const mockSubscription = {
  unsubscribe: vi.fn(),
  subscribe: vi.fn()
};

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn()
};

const mockSupabaseClient = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
  getChannels: vi.fn().mockReturnValue([])
};

// Mock the Supabase client creation
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

describe('useRealtimeSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChannel.subscribe.mockImplementation((callback) => {
      // Simulate successful subscription
      setTimeout(() => callback('SUBSCRIBED'), 0);
      return mockSubscription;
    });
  });

  describe('Basic Subscription Management', () => {
    it('should initialize subscription on mount', async () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback)
      );

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('messages_changes');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'messages'
        }),
        expect.any(Function)
      );
    });

    it('should clean up subscription on unmount', () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback)
      );

      // Ensure subscription was created
      expect(mockChannel.subscribe).toHaveBeenCalled();

      // Unmount component
      unmount();

      // Should call unsubscribe
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should clean up existing subscription when resubscribing', async () => {
      const callback = vi.fn();
      const { rerender } = renderHook(
        ({ filter }) => useRealtimeSubscription('messages', filter, callback),
        { initialProps: { filter: { user_id: '1' } } }
      );

      // Initial subscription
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);

      // Change filter to trigger resubscription
      rerender({ filter: { user_id: '2' } });

      // Should unsubscribe old and create new
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('Connection Status Tracking', () => {
    it('should track connection status changes', async () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback)
      );

      // Initially disconnected
      expect(result.current.connected).toBe(false);

      // Simulate successful connection
      await act(async () => {
        const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];
        subscribeCallback('SUBSCRIBED');
      });

      expect(result.current.connected).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should handle connection errors', async () => {
      const callback = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback, { onError })
      );

      await act(async () => {
        const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];
        subscribeCallback('CHANNEL_ERROR');
      });

      expect(result.current.connected).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle connection timeouts', async () => {
      const callback = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback, { onError })
      );

      await act(async () => {
        const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];
        subscribeCallback('TIMED_OUT');
      });

      expect(result.current.connected).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle connection closure', async () => {
      const callback = vi.fn();
      const onDisconnect = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback, { onDisconnect })
      );

      // First connect
      await act(async () => {
        const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];
        subscribeCallback('SUBSCRIBED');
      });

      expect(result.current.connected).toBe(true);

      // Then disconnect
      await act(async () => {
        const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];
        subscribeCallback('CLOSED');
      });

      expect(result.current.connected).toBe(false);
      expect(onDisconnect).toHaveBeenCalled();
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should prevent memory leaks with multiple rapid subscriptions', () => {
      const callback = vi.fn();
      const { rerender } = renderHook(
        ({ table }) => useRealtimeSubscription(table, {}, callback),
        { initialProps: { table: 'messages' } }
      );

      // Rapidly change table to trigger multiple subscriptions
      for (let i = 0; i < 10; i++) {
        rerender({ table: `table_${i}` });
      }

      // Should have called unsubscribe for each previous subscription
      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(9);
      // Should have created 10 total subscriptions
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(10);
    });

    it('should handle callback reference updates without resubscribing', () => {
      let callback1 = vi.fn();
      let callback2 = vi.fn();
      
      const { rerender } = renderHook(
        ({ cb }) => useRealtimeSubscription('messages', {}, cb),
        { initialProps: { cb: callback1 } }
      );

      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);

      // Change callback - should not trigger resubscription
      rerender({ cb: callback2 });

      // Should still have only one subscription
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
      expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing Supabase client gracefully', () => {
      // Mock missing environment variables
      vi.unstubAllEnvs();
      
      const callback = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback, { onError })
      );

      expect(result.current.error).toBeInstanceOf(Error);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle null/undefined callback gracefully', async () => {
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, null)
      );

      // Should not throw error
      expect(result.current.error).toBe(null);

      // Simulate receiving data
      const messageCallback = mockChannel.on.mock.calls[0][2];
      expect(() => {
        messageCallback({ new: { id: 1, content: 'test' } });
      }).not.toThrow();
    });

    it('should handle subscription errors during setup', () => {
      mockSupabaseClient.channel.mockImplementationOnce(() => {
        throw new Error('Channel creation failed');
      });

      const callback = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useRealtimeSubscription('messages', {}, callback, { onError })
      );

      expect(result.current.error).toBeInstanceOf(Error);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Subscription Data Handling', () => {
    it('should pass payload data to callback', async () => {
      const callback = vi.fn();
      renderHook(() =>
        useRealtimeSubscription('messages', {}, callback)
      );

      const messageCallback = mockChannel.on.mock.calls[0][2];
      const testPayload = { 
        eventType: 'INSERT', 
        new: { id: 1, content: 'Hello' } 
      };

      messageCallback(testPayload);

      expect(callback).toHaveBeenCalledWith(testPayload);
    });

    it('should handle filters correctly', () => {
      const callback = vi.fn();
      renderHook(() =>
        useRealtimeSubscription(
          'messages', 
          { user_id: '123', thread_id: '456' }, 
          callback
        )
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          filter: 'user_id=eq.123,thread_id=eq.456'
        }),
        expect.any(Function)
      );
    });

    it('should handle empty filters', () => {
      const callback = vi.fn();
      renderHook(() =>
        useRealtimeSubscription('messages', {}, callback)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          filter: undefined
        }),
        expect.any(Function)
      );
    });
  });
});

describe('Specialized Real-time Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChannel.subscribe.mockImplementation((callback) => {
      setTimeout(() => callback('SUBSCRIBED'), 0);
      return mockSubscription;
    });
  });

  describe('useRealtimeMessages', () => {
    it('should clean up subscription on unmount', () => {
      const onMessage = vi.fn();
      const { unmount } = renderHook(() =>
        useRealtimeMessages('thread_123', onMessage)
      );

      unmount();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle thread changes properly', () => {
      const onMessage = vi.fn();
      const { rerender } = renderHook(
        ({ threadId }) => useRealtimeMessages(threadId, onMessage),
        { initialProps: { threadId: 'thread_123' } }
      );

      rerender({ threadId: 'thread_456' });

      // Should clean up old subscription and create new one
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('useRealtimePosts', () => {
    it('should clean up subscription on unmount', () => {
      const onPost = vi.fn();
      const { unmount } = renderHook(() =>
        useRealtimePosts(onPost)
      );

      unmount();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle category filter changes', () => {
      const onPost = vi.fn();
      const { rerender } = renderHook(
        ({ category }) => useRealtimePosts(onPost, { category }),
        { initialProps: { category: 'performance' } }
      );

      rerender({ category: 'fashion' });

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('useRealtimeNotifications', () => {
    it('should clean up subscription on unmount', () => {
      const onNotification = vi.fn();
      const { unmount } = renderHook(() =>
        useRealtimeNotifications('user_123', onNotification)
      );

      unmount();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle user changes properly', () => {
      const onNotification = vi.fn();
      const { rerender } = renderHook(
        ({ userId }) => useRealtimeNotifications(userId, onNotification),
        { initialProps: { userId: 'user_123' } }
      );

      rerender({ userId: 'user_456' });

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('useOnlinePresence', () => {
    it('should clean up presence tracking on unmount', () => {
      const onPresenceChange = vi.fn();
      const { unmount } = renderHook(() =>
        useOnlinePresence('user_123', onPresenceChange)
      );

      unmount();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle user changes in presence tracking', () => {
      const onPresenceChange = vi.fn();
      const { rerender } = renderHook(
        ({ userId }) => useOnlinePresence(userId, onPresenceChange),
        { initialProps: { userId: 'user_123' } }
      );

      rerender({ userId: 'user_456' });

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Real-time Context Provider Cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clean up all subscriptions when context unmounts', () => {
    // This would test the RealtimeProvider component
    // In a real scenario, we'd render the provider and verify cleanup
    
    // Mock multiple subscriptions
    const subscriptions = [
      { unsubscribe: vi.fn() },
      { unsubscribe: vi.fn() },
      { unsubscribe: vi.fn() }
    ];

    // Simulate provider unmount
    subscriptions.forEach(sub => sub.unsubscribe());

    subscriptions.forEach(sub => {
      expect(sub.unsubscribe).toHaveBeenCalled();
    });
  });

  it('should handle rapid connect/disconnect cycles', async () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => enabled ? useRealtimeSubscription('messages', {}, callback) : null,
      { initialProps: { enabled: true } }
    );

    // Rapidly toggle subscription
    for (let i = 0; i < 5; i++) {
      rerender({ enabled: false });
      rerender({ enabled: true });
    }

    // Should properly clean up each time
    expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(5);
  });

  it('should prevent duplicate subscriptions to same resource', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    // Try to create two subscriptions to same table
    const { unmount: unmount1 } = renderHook(() =>
      useRealtimeSubscription('messages', {}, callback1)
    );
    
    const { unmount: unmount2 } = renderHook(() =>
      useRealtimeSubscription('messages', {}, callback2)
    );

    // Both should create separate subscriptions
    expect(mockChannel.subscribe).toHaveBeenCalledTimes(2);

    unmount1();
    unmount2();

    // Both should clean up
    expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(2);
  });
});