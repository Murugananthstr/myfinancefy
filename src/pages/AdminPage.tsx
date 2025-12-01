import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  Alert, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { seedDatabase } from '../seed';

const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleSeedDatabase = async () => {
    if (!window.confirm('Are you sure? This will overwrite default configuration data in Firestore.')) {
      return;
    }

    setLoading(true);
    setStatus(null);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting database seed...`]);

    try {
      // We can't easily capture console.logs from the imported function without modifying it,
      // so we'll just wrap the call.
      await seedDatabase();
      
      setStatus({ type: 'success', message: 'Database seeded successfully!' });
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Seed completed successfully.`]);
    } catch (error: any) {
      console.error(error);
      setStatus({ type: 'error', message: `Error seeding database: ${error.message}` });
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage system-level configurations and database maintenance.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StorageIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5">
            Database Management
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" paragraph>
          Use the tools below to initialize or reset the application database.
          <br />
          <strong>Warning:</strong> These actions may overwrite existing data.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="warning" 
            onClick={handleSeedDatabase}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <StorageIcon />}
            size="large"
          >
            {loading ? 'Seeding...' : 'Seed Database with Defaults'}
          </Button>
        </Box>

        {status && (
          <Alert severity={status.type} sx={{ mt: 3 }}>
            {status.message}
          </Alert>
        )}

        {logs.length > 0 && (
          <Box sx={{ mt: 4, bgcolor: 'action.hover', p: 2, borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>Activity Log:</Typography>
            <List dense>
              {logs.map((log, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    {log.includes('Error') ? <ErrorIcon color="error" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={log} primaryTypographyProps={{ variant: 'caption', fontFamily: 'monospace' }} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminPage;
