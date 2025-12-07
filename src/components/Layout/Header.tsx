import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider, 
  ListItemIcon,
  Box,
  Button,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  handleDrawerToggle: () => void;
}

export default function Header({ handleDrawerToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  
  // Profile Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Notification Menu State
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const openNotificationMenu = Boolean(notificationAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    markAllRead();
    handleNotificationClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Navigation App
        </Typography>

        {/* Notification Bell */}
        <IconButton
          color="inherit"
          onClick={handleNotificationClick}
          sx={{ ml: 1 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={openNotificationMenu}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 0,
            sx: {
              width: 320,
              maxHeight: 400,
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: 2,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="No notifications" />
              </ListItem>
            ) : (
              notifications.map((notification) => (
                <ListItemButton 
                  key={notification.id} 
                  onClick={handleNotificationClose}
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ListItemText 
                    primary={notification.text} 
                    secondary={notification.time}
                    primaryTypographyProps={{
                      fontWeight: notification.read ? 'normal' : 'bold',
                      variant: 'body2'
                    }}
                  />
                  {!notification.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', ml: 1 }} />
                  )}
                </ListItemButton>
              ))
            )}
          </List>
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button size="small" fullWidth>View All</Button>
          </Box>
        </Menu>
        
        {/* Profile Avatar */}
        <IconButton
          onClick={handleMenuClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={openMenu ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openMenu ? 'true' : undefined}
        >
          <Avatar 
            sx={{ width: 32, height: 32 }} 
            src={currentUser?.photoURL || undefined}
            alt={currentUser?.displayName || 'User'}
          >
            {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={openMenu}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              width: 320,
              borderRadius: 2,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {currentUser?.email}
            </Typography>
            
            <Avatar 
              sx={{ width: 80, height: 80, mb: 1, mt: 1 }} 
              src={currentUser?.photoURL || undefined}
              alt={currentUser?.displayName || 'User'}
            />
            
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Hi, {currentUser?.displayName || 'User'}!
            </Typography>
            
            <Button 
              variant="outlined" 
              sx={{ mt: 2, mb: 1, borderRadius: 5, textTransform: 'none' }}
              onClick={handleSettings}
            >
              Manage your Account
            </Button>
          </Box>
          
          <Divider />
          
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
