import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import toast from 'react-hot-toast';
import apiClient, { api, handleApiError, isApiError, getApiErrorStatus, getApiErrorMessage } from '../client';

// Mock dependencies
vi.mock('react-hot-toast');
vi.mock('axios');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/dashboard',
    href: '/dashboard'
  },
  writable: true
});

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token exists', () => {
      const config = { headers: {} };
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const interceptor = apiClient.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
      expect(result.metadata.startTime).toBeInstanceOf(Date);
    });

    it('should not add authorization header when token does not exist', () => {
      const config = { headers: {} };
      localStorageMock.getItem.mockReturnValue(null);
      
      const interceptor = apiClient.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    let responseInterceptor;

    beforeEach(() => {
      responseInterceptor = apiClient.interceptors.response.handlers[0];
    });

    describe('Network Errors', () => {
      it('should retry network errors with exponential backoff', async () => {
        const error = { message: 'Network Error' };
        const originalRequest = { _retryCount: 0 };
        
        vi.spyOn(apiClient, 'request').mockResolvedValueOnce({ data: 'success' });
        
        const result = await responseInterceptor.rejected({ ...error, config: originalRequest });
        
        expect(originalRequest._retryCount).toBe(1);
      });

      it('should stop retrying after max attempts', async () => {
        const error = { message: 'Network Error' };
        const originalRequest = { _retryCount: 3 };
        
        await expect(
          responseInterceptor.rejected({ ...error, config: originalRequest })
        ).rejects.toThrow();
        
        expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
      });

      it('should not retry requests marked with _noRetry', async () => {
        const error = { message: 'Network Error' };
        const originalRequest = { _retryCount: 0, _noRetry: true };
        
        await expect(
          responseInterceptor.rejected({ ...error, config: originalRequest })
        ).rejects.toThrow();
        
        expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
      });
    });

    describe('401 Unauthorized', () => {
      it('should attempt token refresh when refresh token exists', async () => {
        const error = {
          response: { status: 401, data: {} },
          config: { headers: {} }
        };
        
        localStorageMock.getItem.mockImplementation((key) => {
          if (key === 'refreshToken') return 'refresh-token';
          return null;
        });
        
        const mockRefreshResponse = {
          data: { token: 'new-token', refreshToken: 'new-refresh-token' }
        };
        
        axios.post.mockResolvedValueOnce(mockRefreshResponse);
        vi.spyOn(apiClient, 'request').mockResolvedValueOnce({ data: 'success' });
        
        await responseInterceptor.rejected(error);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      });

      it('should clear tokens and redirect on refresh failure', async () => {
        const error = {
          response: { status: 401, data: {} },
          config: { headers: {} }
        };
        
        localStorageMock.getItem.mockReturnValue('refresh-token');
        axios.post.mockRejectedValueOnce(new Error('Refresh failed'));
        
        await expect(responseInterceptor.rejected(error)).rejects.toThrow();
        
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      });

      it('should not show error on login page', async () => {
        window.location.pathname = '/login';
        
        const error = {
          response: { status: 401, data: {} },
          config: { headers: {} }
        };
        
        await expect(responseInterceptor.rejected(error)).rejects.toThrow();
        
        expect(toast.error).not.toHaveBeenCalled();
      });
    });

    describe('429 Rate Limiting', () => {
      it('should retry with backoff on rate limiting', async () => {
        const error = {
          response: { 
            status: 429, 
            headers: { 'retry-after': '2' },
            data: {} 
          },
          config: { _retryCount: 0 }
        };
        
        vi.spyOn(apiClient, 'request').mockResolvedValueOnce({ data: 'success' });
        
        await responseInterceptor.rejected(error);
        
        expect(error.config._retryCount).toBe(1);
      });

      it('should respect retry-after header', async () => {
        const error = {
          response: { 
            status: 429, 
            headers: { 'retry-after': '5' },
            data: {} 
          },
          config: { _retryCount: 0 }
        };
        
        vi.spyOn(apiClient, 'request').mockResolvedValueOnce({ data: 'success' });
        const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
        
        await responseInterceptor.rejected(error);
        
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      });
    });

    describe('Server Errors (5xx)', () => {
      it('should retry server errors with exponential backoff', async () => {
        const error = {
          response: { status: 500, data: {} },
          config: { _retryCount: 0 }
        };
        
        vi.spyOn(apiClient, 'request').mockResolvedValueOnce({ data: 'success' });
        
        await responseInterceptor.rejected(error);
        
        expect(error.config._retryCount).toBe(1);
      });

      it('should not retry requests marked with _noRetry', async () => {
        const error = {
          response: { status: 500, data: {} },
          config: { _retryCount: 0, _noRetry: true }
        };
        
        await expect(responseInterceptor.rejected(error)).rejects.toThrow();
        
        expect(toast.error).toHaveBeenCalledWith('Server error. Please try again later.');
      });
    });

    describe('Toast Throttling', () => {
      it('should throttle repeated error messages', async () => {
        const error1 = {
          response: { status: 403, data: {} },
          config: {}
        };
        const error2 = {
          response: { status: 403, data: {} },
          config: {}
        };
        
        await expect(responseInterceptor.rejected(error1)).rejects.toThrow();
        await expect(responseInterceptor.rejected(error2)).rejects.toThrow();
        
        // Should only show toast once due to throttling
        expect(toast.error).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('API Endpoints', () => {
    beforeEach(() => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} });
      vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
      vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} });
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: {} });
    });

    describe('Authentication', () => {
      it('should call login endpoint', async () => {
        await api.auth.login('test@example.com');
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      });

      it('should call refresh endpoint with noRetry flag', async () => {
        await api.auth.refresh('refresh-token');
        expect(apiClient.post).toHaveBeenCalledWith(
          '/api/auth/refresh', 
          { refreshToken: 'refresh-token' }, 
          { _noRetry: true }
        );
      });

      it('should call profile endpoints', async () => {
        await api.auth.getProfile();
        expect(apiClient.get).toHaveBeenCalledWith('/api/auth/profile');

        await api.auth.updateProfile({ name: 'Test User' });
        expect(apiClient.put).toHaveBeenCalledWith('/api/auth/profile', { name: 'Test User' });
      });
    });

    describe('File Upload', () => {
      it('should validate files before upload', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        await api.upload.validate(file);
        
        expect(apiClient.post).toHaveBeenCalledWith(
          '/api/upload/validate',
          expect.any(FormData),
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      });

      it('should upload single file with progress callback', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const progressCallback = vi.fn();
        
        await api.upload.single(file, progressCallback);
        
        expect(apiClient.post).toHaveBeenCalledWith(
          '/api/upload',
          expect.any(FormData),
          expect.objectContaining({
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
            onUploadProgress: expect.any(Function)
          })
        );
      });

      it('should upload multiple files with progress callback', async () => {
        const files = [
          new File(['test1'], 'test1.txt', { type: 'text/plain' }),
          new File(['test2'], 'test2.txt', { type: 'text/plain' })
        ];
        const progressCallback = vi.fn();
        
        await api.upload.multiple(files, progressCallback);
        
        expect(apiClient.post).toHaveBeenCalledWith(
          '/api/upload/multiple',
          expect.any(FormData),
          expect.objectContaining({
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000,
            onUploadProgress: expect.any(Function)
          })
        );
      });
    });
  });

  describe('Utility Functions', () => {
    describe('handleApiError', () => {
      it('should show custom message when provided', () => {
        const error = { response: { data: { message: 'Server error' } } };
        handleApiError(error, 'Custom error message');
        
        expect(toast.error).toHaveBeenCalledWith('Custom error message');
      });

      it('should extract error message from response', () => {
        const error = { response: { data: { message: 'Server error' } } };
        handleApiError(error);
        
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });

      it('should fallback to generic message', () => {
        const error = {};
        handleApiError(error);
        
        expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
      });
    });

    describe('isApiError', () => {
      it('should return true for API errors', () => {
        const error = { response: { status: 404 } };
        expect(isApiError(error)).toBe(true);
      });

      it('should return false for non-API errors', () => {
        const error = { message: 'Network error' };
        expect(isApiError(error)).toBe(false);
      });
    });

    describe('getApiErrorStatus', () => {
      it('should return status code', () => {
        const error = { response: { status: 404 } };
        expect(getApiErrorStatus(error)).toBe(404);
      });

      it('should return undefined for non-API errors', () => {
        const error = { message: 'Network error' };
        expect(getApiErrorStatus(error)).toBeUndefined();
      });
    });

    describe('getApiErrorMessage', () => {
      it('should extract message from response data', () => {
        const error = { response: { data: { message: 'Not found' } } };
        expect(getApiErrorMessage(error)).toBe('Not found');
      });

      it('should extract error from response data', () => {
        const error = { response: { data: { error: 'Bad request' } } };
        expect(getApiErrorMessage(error)).toBe('Bad request');
      });

      it('should fallback to error message', () => {
        const error = { message: 'Network error' };
        expect(getApiErrorMessage(error)).toBe('Network error');
      });

      it('should fallback to generic message', () => {
        const error = {};
        expect(getApiErrorMessage(error)).toBe('An unexpected error occurred');
      });
    });
  });
});