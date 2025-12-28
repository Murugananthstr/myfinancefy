import type { ReactNode } from 'react';
import { useState, Fragment } from 'react';
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Toolbar,
  Divider,
  Box,
  Typography
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import LayersIcon from '@mui/icons-material/Layers';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface MenuItem {
  title: string;
  icon?: ReactNode;
  path?: string;
  children?: MenuItem[];
  divider?: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    divider: true
  },
  {
    title: 'Reports',
    icon: <AssessmentIcon />,
    children: [
      { title: 'Sales', path: '/reports/sales', icon: <AttachMoneyIcon /> },
      { title: 'Traffic', path: '/reports/traffic', icon: <TrendingUpIcon /> }
    ],
    divider: true
  },
  {
    title: 'Management',
    icon: <ManageAccountsIcon />,
    children: [
      { title: 'Users', path: '/management/users', icon: <PersonIcon /> },
      { title: 'Roles', path: '/management/roles', icon: <SecurityIcon /> }
    ],
    divider: true
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings'
  }
];

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAdmin } from '../../hooks/useAdmin';

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  isMobile: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, drawerWidth, isMobile, onClose }: SidebarProps) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { isAdmin, hasPermission } = useAdmin();

  // Dynamically compute menu items to include Admin Panel if user is admin
  const displayMenuItems: MenuItem[] = [
    ...menuItems,
    ...(isAdmin ? [{
      title: 'Admin Panel',
      icon: <AdminPanelSettingsIcon />,
      path: '/admin',
      divider: true
    }] : []),
    ...(hasPermission('bond:access') ? [{
      title: 'Bond Market',
      icon: <AccountBalanceIcon />,
      path: '/bonds',
      divider: true
    }] : [])
  ];

  const handleSubmenuClick = (title: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleMenuItemClick = () => {
    // Close drawer on mobile after clicking a menu item
    onClose();
  };

  const drawerContent = (
    <>
      <Toolbar /> {/* Spacer for header */}
      <Divider />
      <List>
        {displayMenuItems.map((item) => (
          <Fragment key={item.title}>
            <ListItemButton 
              onClick={() => {
                if (item.children) {
                  handleSubmenuClick(item.title);
                } else {
                  handleMenuItemClick();
                }
              }}
              component={item.children ? 'div' : RouterLink}
              to={item.children ? undefined : (item.path || '')}
              selected={!item.children && location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
              {item.children && (openSubmenus[item.title] ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            {item.children && (
              <Collapse in={openSubmenus[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton 
                      key={child.title} 
                      sx={{ pl: 4 }}
                      component={RouterLink}
                      to={child.path || ''}
                      selected={location.pathname === child.path}
                      onClick={handleMenuItemClick}
                    >
                      <ListItemIcon>
                        {child.icon || <LayersIcon />}
                      </ListItemIcon>
                      <ListItemText primary={child.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
            {item.divider && <Divider />}
          </Fragment>
        ))}
      </List>
      
      {/* Debug Info */}
      <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid #e5e7eb' }}>
        <Typography variant="caption" display="block" color="text.secondary">
           Role: {useAdmin().userProfile?.role}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
           Perms: {JSON.stringify(useAdmin().userProfile?.permissions)}
        </Typography>
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile drawer - temporary overlay */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Desktop drawer - persistent
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: open ? drawerWidth : 0,
            flexShrink: 0,
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
            }),
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
