import { Navigate } from 'react-router-dom';
import { Alert, Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, currentUser } = useAdmin();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
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
          Current User: {currentUser?.email}
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return <>{children}</>;
}
