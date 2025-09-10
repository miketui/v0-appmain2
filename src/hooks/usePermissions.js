import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for checking user permissions across the application
 * Provides cached permission checks and role-based access control
 */
export const usePermissions = () => {
  const { userProfile, hasRole, isAdmin, isLeaderOrAdmin, isMemberOrAbove } = useAuth();

  // Cache permission checks to avoid redundant calculations
  const permissions = useMemo(() => {
    if (!userProfile) {
      return {
        canViewDocs: false,
        canUploadDocs: false,
        canChat: false,
        canPost: false,
        canModerate: false,
        canManageUsers: false,
        canManageHouses: false,
        canViewAnalytics: false,
        isApplicant: false,
        isMember: false,
        isLeader: false,
        isAdmin: false
      };
    }

    const role = userProfile.role;
    const status = userProfile.status;

    return {
      // Document permissions
      canViewDocs: isMemberOrAbove() && status === 'active',
      canUploadDocs: isAdmin(),
      
      // Communication permissions
      canChat: isMemberOrAbove() && status === 'active',
      canPost: isMemberOrAbove() && status === 'active',
      
      // Moderation permissions
      canModerate: isLeaderOrAdmin() && status === 'active',
      
      // Admin permissions
      canManageUsers: isAdmin(),
      canManageHouses: isAdmin(),
      canViewAnalytics: isAdmin(),
      
      // Role checks
      isApplicant: role === 'Applicant',
      isMember: role === 'Member',
      isLeader: role === 'Leader',
      isAdmin: role === 'Admin',
      
      // Status checks
      isPending: status === 'pending',
      isActive: status === 'active',
      isBanned: status === 'banned'
    };
  }, [userProfile, hasRole, isAdmin, isLeaderOrAdmin, isMemberOrAbove]);

  return permissions;
};