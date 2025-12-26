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

  return {
    isAdmin,
    isSuperAdmin,
    currentUser,
    userProfile
  };
}
