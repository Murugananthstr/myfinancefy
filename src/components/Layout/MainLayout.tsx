import { useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { useThemeSettings } from '../../contexts/ThemeContext';

const drawerWidth = 240;

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const { sidebarOpen, setSidebarOpen } = useThemeSettings(); // Get user's preference from database
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Derived state: On mobile use local state, on desktop use global preference
  const open = isMobile ? mobileOpen : sidebarOpen;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      // On desktop, toggle the persistent setting
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header handleDrawerToggle={handleDrawerToggle} />
      <Sidebar 
        open={open} 
        drawerWidth={drawerWidth} 
        isMobile={isMobile}
        onClose={handleDrawerClose}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          overflowX: 'hidden',
        }}
      >
        <Toolbar /> {/* Spacer for fixed header */}
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
