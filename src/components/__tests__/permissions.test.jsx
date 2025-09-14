import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';
import { usePermissions } from '../../hooks/usePermissions';

// Mock AuthContext
const mockAuthContext = {
  user: null,
  userProfile: null,
  loading: false,
  initializing: false,
  hasRole: vi.fn(),
  isAdmin: vi.fn(),
  isLeaderOrAdmin: vi.fn(),
  isMemberOrAbove: vi.fn()
};

vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContext
}));

// Mock LoadingSpinner
vi.mock('../LoadingSpinner', () => ({
  default: ({ text }) => <div data-testid="loading-spinner">{text}</div>
}));

// Test component that uses permissions
const TestComponent = ({ requiredPermission, children }) => {
  const permissions = usePermissions();
  
  if (requiredPermission && !permissions[requiredPermission]) {
    return <div data-testid="access-denied">Access Denied</div>;
  }
  
  return <div data-testid="protected-content">{children}</div>;
};

// Helper to render with router
const renderWithRouter = (component, initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute);
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Permission-Based UI Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth context
    mockAuthContext.user = null;
    mockAuthContext.userProfile = null;
    mockAuthContext.loading = false;
    mockAuthContext.initializing = false;
    mockAuthContext.hasRole.mockReturnValue(false);
    mockAuthContext.isAdmin.mockReturnValue(false);
    mockAuthContext.isLeaderOrAdmin.mockReturnValue(false);
    mockAuthContext.isMemberOrAbove.mockReturnValue(false);
  });

  describe('ProtectedRoute Component', () => {
    const ProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;

    it('should show loading spinner while initializing', () => {
      mockAuthContext.initializing = true;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading spinner while loading user data', () => {
      mockAuthContext.loading = true;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      mockAuthContext.user = null;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      );
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should show loading profile when user exists but profile is loading', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = null;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    it('should redirect applicants to application page when requiresApproval is true', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { 
        role: 'Applicant', 
        status: 'pending' 
      };
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute requiresApproval={true}>
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
          <Route path="/apply" element={<div data-testid="apply-page">Application Page</div>} />
        </Routes>
      );
      
      expect(screen.getByTestId('apply-page')).toBeInTheDocument();
    });

    it('should check role permissions when roles are specified', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Member', status: 'active' };
      mockAuthContext.hasRole.mockReturnValue(false); // User doesn't have required role
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['Admin']}>
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<div data-testid="home">Home</div>} />
        </Routes>,
        '/admin'
      );
      
      expect(mockAuthContext.hasRole).toHaveBeenCalledWith(['Admin']);
      // Should redirect to home when role check fails
      expect(window.location.pathname).toBe('/');
    });

    it('should render protected content when all checks pass', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Admin', status: 'active' };
      mockAuthContext.hasRole.mockReturnValue(true);
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute roles={['Admin']}>
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should use custom fallback path', () => {
      mockAuthContext.user = null;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute fallbackPath="/custom-login">
                <ProtectedContent />
              </ProtectedRoute>
            } 
          />
          <Route path="/custom-login" element={<div data-testid="custom-login">Custom Login</div>} />
        </Routes>
      );
      
      expect(screen.getByTestId('custom-login')).toBeInTheDocument();
    });
  });

  describe('Role-Based Content Rendering', () => {
    const createUserWithRole = (role, status = 'active') => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role, status };
      
      // Set up role check mocks based on role
      mockAuthContext.isAdmin.mockReturnValue(role === 'Admin');
      mockAuthContext.isLeaderOrAdmin.mockReturnValue(['Admin', 'Leader'].includes(role));
      mockAuthContext.isMemberOrAbove.mockReturnValue(['Admin', 'Leader', 'Member'].includes(role));
    };

    describe('Applicant Role', () => {
      beforeEach(() => {
        createUserWithRole('Applicant', 'pending');
      });

      it('should deny access to member features', () => {
        render(<TestComponent requiredPermission="canViewDocs">Member Content</TestComponent>);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      });

      it('should deny access to chat features', () => {
        render(<TestComponent requiredPermission="canChat">Chat Content</TestComponent>);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      });

      it('should deny access to posting features', () => {
        render(<TestComponent requiredPermission="canPost">Post Content</TestComponent>);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      });

      it('should identify as applicant', () => {
        const TestPermissionDisplay = () => {
          const { isApplicant } = usePermissions();
          return <div data-testid="is-applicant">{isApplicant.toString()}</div>;
        };
        
        render(<TestPermissionDisplay />);
        expect(screen.getByText('true')).toBeInTheDocument();
      });
    });

    describe('Member Role', () => {
      beforeEach(() => {
        createUserWithRole('Member');
      });

      it('should allow access to member features', () => {
        render(<TestComponent requiredPermission="canViewDocs">Member Content</TestComponent>);
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      it('should allow access to chat features', () => {
        render(<TestComponent requiredPermission="canChat">Chat Content</TestComponent>);
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      it('should allow access to posting features', () => {
        render(<TestComponent requiredPermission="canPost">Post Content</TestComponent>);
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      it('should deny access to admin features', () => {
        render(<TestComponent requiredPermission="canManageUsers">Admin Content</TestComponent>);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      });

      it('should deny access to moderation features', () => {
        render(<TestComponent requiredPermission="canModerate">Moderation Content</TestComponent>);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      });
    });

    describe('Leader Role', () => {
      beforeEach(() => {
        createUserWithRole('Leader');
      });

      it('should allow access to all member features', () => {
        render(<TestComponent requiredPermission="canViewDocs">Member Content</TestComponent>);
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      it('should allow access to moderation features', () => {
        render(<TestComponent requiredPermission="canModerate">Moderation Content</TestComponent>);
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      it('should deny access to admin-only features', () => {
        render(<TestComponent requiredPermission="canManageUsers">Admin Content</TestComponent>);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      });

      it('should deny access to document upload', () => {
        render(<TestComponent requiredPermission="canUploadDocs">Upload Content</TestComponent>);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      });
    });

    describe('Admin Role', () => {
      beforeEach(() => {
        createUserWithRole('Admin');
      });

      it('should allow access to all features', () => {
        const permissions = [
          'canViewDocs',
          'canUploadDocs', 
          'canChat',
          'canPost',
          'canModerate',
          'canManageUsers',
          'canManageHouses',
          'canViewAnalytics'
        ];

        permissions.forEach(permission => {
          const { unmount } = render(
            <TestComponent requiredPermission={permission}>Admin Content</TestComponent>
          );
          expect(screen.getByTestId('protected-content')).toBeInTheDocument();
          unmount();
        });
      });

      it('should identify as admin', () => {
        const TestPermissionDisplay = () => {
          const { isAdmin } = usePermissions();
          return <div data-testid="is-admin">{isAdmin.toString()}</div>;
        };
        
        render(<TestPermissionDisplay />);
        expect(screen.getByText('true')).toBeInTheDocument();
      });
    });

    describe('Inactive User Status', () => {
      beforeEach(() => {
        createUserWithRole('Member', 'inactive');
      });

      it('should deny access to most features when inactive', () => {
        const restrictedPermissions = [
          'canViewDocs',
          'canChat',
          'canPost',
          'canModerate'
        ];

        restrictedPermissions.forEach(permission => {
          const { unmount } = render(
            <TestComponent requiredPermission={permission}>Restricted Content</TestComponent>
          );
          expect(screen.getByTestId('access-denied')).toBeInTheDocument();
          unmount();
        });
      });
    });
  });

  describe('Permission-Based UI Components', () => {
    const ConditionalButton = ({ permission, children, ...props }) => {
      const permissions = usePermissions();
      
      if (!permissions[permission]) {
        return null;
      }
      
      return <button {...props}>{children}</button>;
    };

    it('should conditionally render UI elements based on permissions', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Member', status: 'active' };
      mockAuthContext.isMemberOrAbove.mockReturnValue(true);
      
      render(
        <div>
          <ConditionalButton permission="canPost">Create Post</ConditionalButton>
          <ConditionalButton permission="canManageUsers">Manage Users</ConditionalButton>
        </div>
      );
      
      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
    });

    it('should show different UI based on user role', () => {
      const RoleBasedNav = () => {
        const { isAdmin, canModerate, canPost } = usePermissions();
        
        return (
          <nav>
            {canPost && <a href="/create">Create Post</a>}
            {canModerate && <a href="/moderate">Moderate</a>}
            {isAdmin && <a href="/admin">Admin Panel</a>}
          </nav>
        );
      };

      // Test with Member role
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Member', status: 'active' };
      mockAuthContext.isMemberOrAbove.mockReturnValue(true);
      
      const { rerender } = render(<RoleBasedNav />);
      
      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.queryByText('Moderate')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();

      // Test with Admin role
      mockAuthContext.userProfile.role = 'Admin';
      mockAuthContext.isAdmin.mockReturnValue(true);
      mockAuthContext.isLeaderOrAdmin.mockReturnValue(true);
      
      rerender(<RoleBasedNav />);
      
      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.getByText('Moderate')).toBeInTheDocument();
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    it('should handle permission changes dynamically', async () => {
      const DynamicContent = () => {
        const { canViewDocs } = usePermissions();
        return <div>{canViewDocs ? 'Can view docs' : 'Cannot view docs'}</div>;
      };

      // Start with Applicant (no access)
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Applicant', status: 'pending' };
      
      const { rerender } = render(<DynamicContent />);
      expect(screen.getByText('Cannot view docs')).toBeInTheDocument();

      // Upgrade to Member (has access)
      mockAuthContext.userProfile = { role: 'Member', status: 'active' };
      mockAuthContext.isMemberOrAbove.mockReturnValue(true);
      
      rerender(<DynamicContent />);
      expect(screen.getByText('Can view docs')).toBeInTheDocument();
    });
  });

  describe('Permission Caching and Performance', () => {
    it('should cache permission calculations', () => {
      const spy = vi.spyOn(mockAuthContext, 'isAdmin');
      
      const TestMultipleChecks = () => {
        const { isAdmin } = usePermissions();
        // Use permission multiple times
        return (
          <div>
            {isAdmin && <div>Admin Panel</div>}
            {isAdmin && <div>Admin Settings</div>}
            {isAdmin && <div>Admin Analytics</div>}
          </div>
        );
      };

      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Admin', status: 'active' };
      mockAuthContext.isAdmin.mockReturnValue(true);
      
      render(<TestMultipleChecks />);
      
      // Should only call isAdmin once due to memoization
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should recalculate permissions when user profile changes', () => {
      const TestPermissionChange = () => {
        const { canPost } = usePermissions();
        return <div>{canPost ? 'Can post' : 'Cannot post'}</div>;
      };

      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Applicant', status: 'pending' };
      
      const { rerender } = render(<TestPermissionChange />);
      expect(screen.getByText('Cannot post')).toBeInTheDocument();

      // Change user profile
      mockAuthContext.userProfile = { role: 'Member', status: 'active' };
      mockAuthContext.isMemberOrAbove.mockReturnValue(true);
      
      rerender(<TestPermissionChange />);
      expect(screen.getByText('Can post')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null userProfile gracefully', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = null;
      
      render(<TestComponent requiredPermission="canPost">Content</TestComponent>);
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    it('should handle undefined permissions gracefully', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { role: 'Member', status: 'active' };
      
      render(<TestComponent requiredPermission="nonExistentPermission">Content</TestComponent>);
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    it('should handle malformed user profile data', () => {
      mockAuthContext.user = { id: '1', email: 'test@example.com' };
      mockAuthContext.userProfile = { invalidData: true };
      
      expect(() => {
        render(<TestComponent requiredPermission="canPost">Content</TestComponent>);
      }).not.toThrow();
    });
  });
});
