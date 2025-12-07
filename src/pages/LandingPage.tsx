import { Typography, Box, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      console.error("Failed to log out");
    }
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to the Landing Page
      </Typography>
      <Typography variant="body1" gutterBottom>
        You are logged in as: {currentUser && currentUser.email}
      </Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Log Out
      </Button>
    </Box>
  );
}
