import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// ⚠️ SECURITY: Replace this with your actual admin email(s)
// In a real production app, you would check a 'role' field in the user's Firestore document
// or a Custom Claim on the Firebase User object.
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || '')
  .split(',')
  .map((email: string) => email.trim())
  .filter((email: string) => email.length > 0);

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!currentUser.email || !ADMIN_EMAILS.includes(currentUser.email)) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="error" variant="filled" sx={{ mb: 4, justifyContent: 'center' }}>
          <Typography variant="h6">Access Denied</Typography>
        </Alert>
        <Typography variant="h5" gutterBottom>
          Restricted Area
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You do not have permission to view this page. This area is restricted to system administrators only.
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, bgcolor: 'grey.100', p: 1, borderRadius: 1, fontFamily: 'monospace' }}>
          Current User: {currentUser.email}
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return <>{children}</>;
}
