import { useAuth } from '../contexts/AuthContext';

export function useAdmin() {
  const { currentUser, userProfile } = useAuth();

  const isSuperAdmin = userProfile?.role === 'super_admin';
  const isAdmin = userProfile?.role === 'admin' || isSuperAdmin;
  
  // Debugging logs
  console.log('[useAdmin] Checking admin access:', { 
    email: currentUser?.email,
    role: userProfile?.role,
    isAdmin,
    isSuperAdmin
  });

  const hasPermission = (permission: string) => {
    // Debug log for permission check
    const hasAccess = (() => {
      if (isSuperAdmin) return true;
      if (userProfile?.permissions?.includes('all')) return true;
      return userProfile?.permissions?.includes(permission) || false;
    })();
    
    // console.log(`[useAdmin] Checking '${permission}' for role '${userProfile?.role}': ${hasAccess}`);
    return hasAccess;
  };

  return {
    isAdmin,
    isSuperAdmin,
    hasPermission,
    currentUser,
    userProfile
  };
}
