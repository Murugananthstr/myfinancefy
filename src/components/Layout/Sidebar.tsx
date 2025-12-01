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
  Divider
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';

interface MenuItem {
  title: string;
  icon?: ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/'
  },
  {
    title: 'Reports',
    icon: <BarChartIcon />,
    children: [
      { title: 'Sales', path: '/reports/sales' },
      { title: 'Traffic', path: '/reports/traffic' }
    ]
  },
  {
    title: 'Management',
    icon: <PeopleIcon />,
    children: [
      { title: 'Users', path: '/management/users' },
      { title: 'Roles', path: '/management/roles' }
    ]
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings'
  }
];

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  isMobile: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, drawerWidth, isMobile, onClose }: SidebarProps) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

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
        {menuItems.map((item) => (
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
                        <LayersIcon />
                      </ListItemIcon>
                      <ListItemText primary={child.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Fragment>
        ))}
      </List>
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
            width: drawerWidth,
            flexShrink: 0,
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
