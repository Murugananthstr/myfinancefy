import { useState, useEffect } from 'react';
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
  ListItemIcon,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
// import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert'; 
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { collection, getDocs, query, Timestamp, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { seedDatabase } from '../seed';
import { useAdmin } from '../hooks/useAdmin';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  role?: string;
  status?: string;
  lastLogin?: Timestamp;
}

interface RoleData {
  id: string; // e.g., 'admin', 'manager'
  name: string; // Display name
  description: string;
  permissions: string[];
  color: string; // For chip color
  isSystem?: boolean; // If true, cannot delete
}

const DEFAULT_ROLES: RoleData[] = [
    { id: 'super_admin', name: 'Super Admin', description: 'Full system & database access', permissions: ['all', 'maintenance'], color: 'error', isSystem: true },
    { id: 'admin', name: 'Administrator', description: 'User & Role management', permissions: ['manage_users'], color: 'primary', isSystem: true },
    { id: 'user', name: 'User', description: 'Standard user access', permissions: ['read_self'], color: 'default', isSystem: true },
    { id: 'manager', name: 'Manager', description: 'Content management', permissions: ['manage_content'], color: 'secondary', isSystem: false }
];

const AVAILABLE_PERMISSIONS = [
    // System Wide
    { id: 'all', label: 'System: Full Super Access (Dangerous)' },

    // Navigation App (Admin System)
    { id: 'view_dashboard', label: 'Admin: View Dashboard' },
    { id: 'manage_users', label: 'Admin: Manage Users' },
    { id: 'manage_roles', label: 'Admin: Manage Roles' },
    { id: 'system_settings', label: 'Admin: System Settings' },
    { id: 'maintenance', label: 'Admin: Database Maintenance' },

    // Finance App
    { id: 'finance:access', label: 'Finance: Access App' },
    { id: 'finance:view_dashboard', label: 'Finance: View Dashboard' },
    { id: 'finance:manage_invoices', label: 'Finance: Manage Invoices' },
    { id: 'finance:approve_expenses', label: 'Finance: Approve Expenses' },

    // HR App
    { id: 'hr:access', label: 'HR: Access App' },
    { id: 'hr:view_employees', label: 'HR: View Employees' },
    { id: 'hr:manage_payroll', label: 'HR: Manage Payroll' },
    { id: 'hr:manage_leave', label: 'HR: Manage Leave Requests' },

    // Bond App
    { id: 'bond:access', label: 'Bonds: Access App' },
    { id: 'bond:view', label: 'Bonds: View Portfolio' },
    { id: 'bond:manage', label: 'Bonds: Manage Holdings' }, // Create/Edit

];

const AdminPage = () => {
  const { userProfile } = useAdmin();

  // Calculate permissions
  const [currentTab, setCurrentTab] = useState(0);
  const [roles, setRoles] = useState<RoleData[]>(DEFAULT_ROLES);
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Specific stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [adminUsers, setAdminUsers] = useState(0);

  // Role management logic
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [roleForm, setRoleForm] = useState<RoleData>({
      id: '', name: '', description: '', color: 'default', permissions: [], isSystem: false
  });

  // Database seed logic
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; message: string } | null>(null);
  const [seedLogs, setSeedLogs] = useState<string[]>([]);
  
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const fetchedUsers: UserData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsers(fetchedUsers);
      
      // Update stats
      setTotalUsers(fetchedUsers.length);
      setActiveUsers(fetchedUsers.filter(u => u.status === 'active').length);
      setPendingUsers(fetchedUsers.filter(u => u.status === 'pending').length);
      setAdminUsers(fetchedUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length);
      
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const q = query(collection(db, 'roles'));
      const querySnapshot = await getDocs(q);
      const fetchedRoles: RoleData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRoles.push({ id: doc.id, ...doc.data() } as RoleData);
      });
      // If no roles in DB (first run), keep default roles, otherwise use DB roles
      // If no roles in DB (first run), keep default roles, otherwise use DB roles
      if (fetchedRoles.length > 0) {
        // Ensure all roles have permissions array
        const safeRoles = fetchedRoles.map(r => ({
            ...r,
            permissions: Array.isArray(r.permissions) ? r.permissions : []
        }));
        setRoles(safeRoles);
      } else {
        // Optional: could auto-seed here or just warn
        console.log("No roles found in DB, using defaults");
      }
    } catch (error) {
       console.error("Error fetching roles:", error);
    }
  };

  const handleRoleClick = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setRoleMenuAnchor(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleRoleSelect = async (roleId: string) => {
     if (!selectedUserId) return;
     try {
         await updateDoc(doc(db, 'users', selectedUserId), { role: roleId });
         // Optimistic update
         setUsers(users.map(u => u.id === selectedUserId ? { ...u, role: roleId } : u));
         setRoleMenuAnchor(null);
         setSelectedUserId(null);
     } catch (error) {
         console.error("Error updating role:", error);
     }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
      // Toggle logic: active -> disabled, anything else -> active
      const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
      try {
          await updateDoc(doc(db, 'users', userId), { status: newStatus });
           // Optimistic update
          setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      } catch (error) {
          console.error("Error updating status:", error);
      }
  };

  const getRoleName = (roleId: string) => {
      const role = roles.find(r => r.id === roleId);
      return role ? role.name : roleId;
  };

  const getRoleColor = (roleId: string) => {
      const role = roles.find(r => r.id === roleId);
      return role ? role.color : 'default';
  };

  const formatDate = (timestamp: any) => {
      if (!timestamp) return 'N/A';
      if (typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
  };

  const handleEditRole = (role: RoleData) => {
      setEditingRole(role);
      // Ensure permissions is an array to avoid crashes
      setRoleForm({
          ...role,
          permissions: Array.isArray(role.permissions) ? role.permissions : []
      });
      setOpenRoleDialog(true);
  };

  const handleDeleteRole = async (roleId: string) => {
      if(!window.confirm("Are you sure you want to delete this role?")) return;
      try {
          await deleteDoc(doc(db, 'roles', roleId));
          setRoles(roles.filter(r => r.id !== roleId));
      } catch (error) {
          console.error("Error deleting role:", error);
      }
  };

  const handleSaveRole = async () => {
       try {
           // Ensure ID is safe
           const roleDocId = roleForm.id || roleForm.name.toLowerCase().replace(/\s+/g, '_');
           const dataToSave = { ...roleForm, id: roleDocId };
           
           console.log("Saving role data:", dataToSave); // Debug log

           await setDoc(doc(db, 'roles', roleDocId), dataToSave);
           
           if (editingRole) {
             setRoles(roles.map(r => r.id === editingRole.id ? dataToSave : r));
           } else {
             setRoles([...roles, dataToSave]);
           }
           setOpenRoleDialog(false);
       } catch (error) {
           console.error("Error saving role:", error);
       }
  };

  const handlePermissionToggle = (permId: string) => {
      const currentPerms = roleForm.permissions;
      if (currentPerms.includes(permId)) {
          setRoleForm({ ...roleForm, permissions: currentPerms.filter(p => p !== permId) });
      } else {
          setRoleForm({ ...roleForm, permissions: [...currentPerms, permId] });
      }
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedLogs([]);
    setSeedStatus(null);
    
    // Helper to log to UI
    const log = (msg: string) => setSeedLogs(prev => [...prev, msg]);

    try {
        log("Starting database seed...");
        await seedDatabase();
        log("Database seeded successfully");
        setSeedStatus({ type: 'success', message: 'Database seeded successfully' });
        fetchUsers(); // Refresh users
    } catch (error: any) {
        log("Error: " + error.message);
        setSeedStatus({ type: 'error', message: 'Seeding failed: ' + error.message });
    } finally {
        setSeedLoading(false);
    }
  };

  // Calculate permissions
  const currentUserRoleDef = roles.find(r => r.id === userProfile?.role);
  // Allow if role explicitly has 'maintenance' OR 'all' permission, or if they are super_admin hardcoded fallback
  const canViewMaintenance = currentUserRoleDef?.permissions?.some(p => p === 'maintenance' || p === 'all') || userProfile?.role === 'super_admin';
  const canViewRoles = currentUserRoleDef?.permissions?.some(p => p === 'manage_roles' || p === 'all') || userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', }} gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and system maintenance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={() => {
               fetchUsers();
               fetchRoles();
            }}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }} 
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="User Management" icon={<GroupIcon />} iconPosition="start" />
          {canViewRoles && <Tab label="Role Definitions" icon={<BadgeIcon />} iconPosition="start" />}
          {canViewMaintenance && (
            <Tab label="Database Maintenance" icon={<StorageIcon />} iconPosition="start" />
          )}
        </Tabs>
      </Box>

      {/* Tab 0: User Management */}
      {currentTab === 0 && (
        <Box>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { title: 'Total Users', value: totalUsers, icon: <GroupIcon sx={{ color: '#3b82f6' }} />, bg: '#eff6ff' },
              { title: 'Active Users', value: activeUsers, icon: <CheckCircleIcon sx={{ color: '#10b981' }} />, bg: '#ecfdf5' },
              { title: 'Pending Approval', value: pendingUsers, icon: <PersonAddIcon sx={{ color: '#f59e0b' }} />, bg: '#fffbeb' },
              { title: 'Admin Users', value: adminUsers, icon: <AdminPanelSettingsIcon sx={{ color: '#8b5cf6' }} />, bg: '#f5f3ff' },
            ].map((stat, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0} sx={{ border: '1px solid #e5e7eb', height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* User Table Section */}
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="action" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  All Users
                </Typography>
                <Chip label={`${users.length} users`} size="small" sx={{ bgcolor: '#f3f4f6' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'flex-end', maxWidth: 600 }}>
                <TextField
                  placeholder="Search by email address..."
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: '#f9fafb' }}
                />
                <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ color: 'text.secondary', borderColor: '#d1d5db' }}>
                  Filters
                </Button>
              </Box>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox /></TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>USER DETAILS</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>ROLE</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>STATUS</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>REGISTRATION</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>LAST LOGIN</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }} align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : users.map((user) => {
                     const role = user.role || 'user';
                     const status = user.status || 'active';
                     const isDisabled = status === 'disabled';
                     const roleName = getRoleName(role);
                     const roleColor = getRoleColor(role);

                     return (
                      <TableRow key={user.id} hover>
                        <TableCell padding="checkbox"><Checkbox /></TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: isDisabled ? 'action.disabled' : '#6366f1' }}>
                                {user.email?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: isDisabled ? 'text.disabled' : 'text.primary' }}>
                                {user.email}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">{user.id}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={role === 'admin' ? <AdminPanelSettingsIcon fontSize="small" /> : <PersonIcon fontSize="small" />} 
                            label={roleName} 
                            size="small" 
                            variant={'filled'}
                            color={roleColor as any}
                            onClick={(e) => handleRoleClick(e, user.id)}
                            sx={{ cursor: 'pointer', fontWeight: 500 }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={status.charAt(0).toUpperCase() + status.slice(1)} 
                            size="small" 
                            sx={{ 
                                bgcolor: isDisabled ? '#fee2e2' : '#ecfdf5', 
                                color: isDisabled ? '#dc2626' : '#059669', 
                                fontWeight: 600 
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{formatDate(user.createdAt)}</Typography>
                        </TableCell>
                         <TableCell>
                          <Typography variant="body2" color="text.secondary">{formatDate(user.updatedAt || user.lastLogin)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            size="small" 
                            color={isDisabled ? "success" : "error"} 
                            sx={{ fontWeight: 600 }}
                            onClick={() => handleStatusChange(user.id, status)}
                          >
                            {isDisabled ? "Enable" : "Disable"}
                          </Button>
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!usersLoading && users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Role Selection Menu */}
          <Menu
              anchorEl={roleMenuAnchor}
              open={Boolean(roleMenuAnchor)}
              onClose={() => setRoleMenuAnchor(null)}
          >
              {roles.map((role) => (
                  <MenuItem key={role.id} onClick={() => handleRoleSelect(role.id)}>
                      <ListItemIcon>
                           {role.id === 'admin' ? <AdminPanelSettingsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText primary={role.name} secondary={role.description} />
                  </MenuItem>
              ))}
          </Menu>
        </Box>
      )}

      {/* Tab 1: Role Definitions */}
      {currentTab === 1 && canViewRoles && (
         <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 3 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                 <Typography variant="h6">System Roles</Typography>
                 <Button startIcon={<AddIcon />} variant="contained" onClick={() => {
                     setEditingRole(null);
                     setRoleForm({ id: '', name: '', description: '', color: 'default', permissions: [] });
                     setOpenRoleDialog(true);
                 }}>
                     Add New Role
                 </Button>
             </Box>
             
             <Grid container spacing={3}>
                 {roles.map((role) => (
                     <Grid key={role.id} size={{ xs: 12, md: 4 }}>
                         <Card variant="outlined">
                             <CardContent>
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                     <Chip label={role.id} size="small" variant="outlined" />
                                     <Box>
                                        <IconButton size="small" onClick={() => handleEditRole(role)} sx={{ mr: 1 }}>
                                             <EditIcon fontSize="small" />
                                         </IconButton>
                                        {!role.isSystem && (
                                            <IconButton size="small" onClick={() => handleDeleteRole(role.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                     </Box>
                                 </Box>
                                 <Typography variant="h6" gutterBottom color={role.color as any}>
                                     {role.name}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary" paragraph>
                                     {role.description}
                                 </Typography>
                                 <Divider sx={{ my: 1 }} />
                                 <Typography variant="caption" color="text.secondary">
                                     Permissions: {role.permissions?.join(', ') || 'None'}
                                 </Typography>
                             </CardContent>
                         </Card>
                     </Grid>
                 ))}
             </Grid>

             {/* Add/Edit Role Dialog */}
             <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
                 <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                 <DialogContent sx={{ minWidth: 400, pt: 2 }}>
                     <Stack spacing={3} sx={{ mt: 1 }}>
                         <TextField 
                             label="Role ID (unique)" 
                             fullWidth 
                             value={roleForm.id}
                             onChange={(e) => setRoleForm({...roleForm, id: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                             disabled={!!editingRole}
                             helperText="Use lowercase logic ID input (e.g. content_manager)"
                         />
                         <TextField 
                             label="Display Name" 
                             fullWidth 
                             value={roleForm.name}
                             onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                         />
                         <TextField 
                             label="Description" 
                             fullWidth 
                             multiline
                             rows={2}
                             value={roleForm.description}
                             onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                         />
                         <FormControl fullWidth>
                             <InputLabel>Color Theme</InputLabel>
                             <Select
                                 value={roleForm.color}
                                 label="Color Theme"
                                 onChange={(e) => setRoleForm({...roleForm, color: e.target.value})}
                             >
                                 <MenuItem value="default">Default (Grey)</MenuItem>
                                 <MenuItem value="primary">Primary (Blue)</MenuItem>
                                 <MenuItem value="secondary">Secondary (Purple)</MenuItem>
                                 <MenuItem value="error">Error (Red)</MenuItem>
                                 <MenuItem value="warning">Warning (Orange)</MenuItem>
                                 <MenuItem value="success">Success (Green)</MenuItem>
                             </Select>
                         </FormControl>

                         <Box>
                            <Typography variant="subtitle2" gutterBottom>Assigned Permissions</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflow: 'auto', border: '1px solid #e5e7eb', p: 1, borderRadius: 1 }}>
                                {AVAILABLE_PERMISSIONS.map((perm) => (
                                    <FormControlLabel
                                        key={perm.id}
                                        control={
                                            <Checkbox 
                                                checked={roleForm.permissions.includes(perm.id)}
                                                onChange={() => handlePermissionToggle(perm.id)}
                                                size="small"
                                            />
                                        }
                                        label={<Typography variant="body2">{perm.label}</Typography>}
                                    />
                                ))}
                            </Box>
                         </Box>
                     </Stack>
                 </DialogContent>
                 <DialogActions>
                     <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
                     <Button variant="contained" onClick={handleSaveRole}>Save Role</Button>
                 </DialogActions>
             </Dialog>
         </Paper>
      )}

      {/* Tab 2: Database Maintenance */}
      {currentTab === 2 && canViewMaintenance && (
        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 4 }}>
          {/* ... existing maintenance content ... */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StorageIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5">
              Database Seeding
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="body1" paragraph color="text.secondary">
            Use the tools below to initialize or reset the application database.
            <br />
            <strong>Warning:</strong> This will overwrite the default navigation menus, roles, and settings.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={handleSeedDatabase}
              disabled={seedLoading}
              startIcon={seedLoading ? <CircularProgress size={20} color="inherit" /> : <StorageIcon />}
              size="large"
            >
              {seedLoading ? 'Seeding...' : 'Seed Database with Defaults'}
            </Button>
          </Box>

          {seedStatus && (
            <Alert severity={seedStatus.type} sx={{ mt: 3 }}>
              {seedStatus.message}
            </Alert>
          )}

          {seedLogs.length > 0 && (
            <Box sx={{ mt: 4, bgcolor: '#f9fafb', p: 2, borderRadius: 1, maxHeight: 200, overflow: 'auto', border: '1px solid #e5e7eb' }}>
              <Typography variant="subtitle2" gutterBottom>Activity Log:</Typography>
              <List dense>
                {seedLogs.map((log, index) => (
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
      )}
    </Box>
  );
};

export default AdminPage;
