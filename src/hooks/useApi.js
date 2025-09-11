import { useState, useEffect, useCallback, useRef } from 'react';
import { api, handleApiError, isApiError } from '../api/client';

/**
 * Custom hook for API calls with loading states, error handling, and caching
 */
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);
  
  const {
    immediate = true,
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
  } = options;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    // Check cache
    if (cache && data && lastFetch) {
      const now = Date.now();
      if (now - lastFetch < cacheTime) {
        return data;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    let attempt = 0;
    const maxAttempts = retries + 1;

    while (attempt < maxAttempts) {
      try {
        const response = await apiCall(...args, {
          signal: abortControllerRef.current.signal
        });
        
        if (!mountedRef.current) return;

        const result = response.data;
        setData(result);
        setLastFetch(Date.now());
        setLoading(false);
        
        onSuccess && onSuccess(result);
        return result;
        
      } catch (err) {
        if (!mountedRef.current) return;
        
        // Don't retry if request was aborted
        if (err.name === 'AbortError') {
          return;
        }

        attempt++;
        
        if (attempt >= maxAttempts) {
          setError(err);
          setLoading(false);
          
          onError ? onError(err) : handleApiError(err);
          throw err;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }, [apiCall, cache, cacheTime, data, lastFetch, onSuccess, onError, retries, retryDelay]);

  // Auto-execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refresh = useCallback(() => {
    setLastFetch(null); // Force refresh
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastFetch(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset,
    isStale: cache && lastFetch && (Date.now() - lastFetch > cacheTime)
  };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (apiCall, options = {}) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  const {
    limit = 10,
    immediate = true,
    onSuccess,
    onError
  } = options;

  const {
    loading,
    error,
    execute: fetchPage
  } = useApi(
    (pageNum = 1) => apiCall({ page: pageNum, limit }),
    [],
    { 
      immediate: false,
      onSuccess: (response) => {
        if (!mountedRef.current) return;
        
        const { data, pagination } = response;
        
        if (pageNum === 1) {
          setItems(data);
        } else {
          setItems(prev => [...prev, ...data]);
        }
        
        if (pagination) {
          setTotalPages(pagination.totalPages);
          setTotalItems(pagination.totalItems);
          setHasMore(pagination.hasMore);
        } else {
          setHasMore(data.length === limit);
        }
        
        onSuccess && onSuccess(response);
      },
      onError
    }
  );

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (immediate) {
      loadMore();
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    return fetchPage(nextPage);
  }, [loading, hasMore, page, fetchPage]);

  const refresh = useCallback(async () => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    return fetchPage(1);
  }, [fetchPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setTotalPages(0);
    setTotalItems(0);
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    page,
    totalPages,
    totalItems,
    loadMore,
    refresh,
    reset
  };
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticApi = (apiCall, options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (optimisticData, ...args) => {
    const previousData = data;
    
    // Apply optimistic update immediately
    setData(optimisticData);
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(...args);
      setData(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      // Revert to previous data on error
      setData(previousData);
      setError(err);
      setLoading(false);
      handleApiError(err);
      throw err;
    }
  }, [data, apiCall]);

  return {
    data,
    loading,
    error,
    execute
  };
};

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export const useMutation = (apiCall, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const { onSuccess, onError, onSettled } = options;

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(...args);
      const result = response.data;
      
      setData(result);
      setLoading(false);
      
      onSuccess && onSuccess(result);
      onSettled && onSettled(result, null);
      
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      
      onError ? onError(err) : handleApiError(err);
      onSettled && onSettled(null, err);
      
      throw err;
    }
  }, [apiCall, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset
  };
};

/**
 * Specific hooks for common operations
 */

// Posts
export const usePosts = (params = {}) => {
  return usePaginatedApi(
    (paginationParams) => api.posts.getAll({ ...params, ...paginationParams }),
    { immediate: true }
  );
};

export const usePost = (id) => {
  return useApi(
    () => api.posts.getById(id),
    [id],
    { immediate: !!id }
  );
};

export const useCreatePost = () => {
  return useMutation(api.posts.create);
};

export const useLikePost = () => {
  return useMutation(api.posts.like);
};

// Documents
export const useDocuments = (params = {}) => {
  return useApi(
    () => api.documents.getAll(params),
    [JSON.stringify(params)]
  );
};

export const useUploadDocument = () => {
  return useMutation(api.documents.upload);
};

// Chat
export const useChatThreads = () => {
  return useApi(() => api.chat.getThreads());
};

export const useMessages = (threadId) => {
  return usePaginatedApi(
    (paginationParams) => api.chat.getMessages(threadId, paginationParams),
    { immediate: !!threadId }
  );
};

export const useSendMessage = () => {
  return useMutation(api.chat.sendMessage);
};

// Users
export const useUsers = (params = {}) => {
  return useApi(
    () => api.users.getAll(params),
    [JSON.stringify(params)]
  );
};

export const useUserSearch = () => {
  return useMutation(api.users.search);
};

// Notifications
export const useNotifications = () => {
  return usePaginatedApi(() => api.notifications.getAll());
};

export const useMarkNotificationAsRead = () => {
  return useMutation(api.notifications.markAsRead);
};