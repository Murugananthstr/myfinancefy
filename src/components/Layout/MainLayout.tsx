import { useState, useEffect } from 'react';
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
  const { sidebarOpen } = useThemeSettings(); // Get user's preference from database
  
  // Use user's preference for desktop, always closed for mobile
  const [open, setOpen] = useState(isMobile ? false : sidebarOpen);

  // Update sidebar state when screen size changes or user preference changes
  useEffect(() => {
    if (isMobile) {
      setOpen(false); // Always closed on mobile
    } else {
      setOpen(sidebarOpen); // Use user's preference on desktop
    }
  }, [isMobile, sidebarOpen]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header open={open} handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} isMobile={isMobile} />
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
          p: { xs: 2, sm: 3 }, // Smaller padding on mobile
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
          ...(open && !isMobile && {
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
            marginLeft: 0,
          }),
          width: '100%',
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
