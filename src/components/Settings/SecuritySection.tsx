import type React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  LinearProgress
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useAuth } from '../../contexts/AuthContext';
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  sendEmailVerification,
  deleteUser
} from 'firebase/auth';
import { db, storage } from '../../firebase';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

export default function SecuritySection() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Email Verification State
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [verificationError, setVerificationError] = useState('');
  
  // Delete Account State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Password strength calculator
  function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;

    if (strength < 40) return { strength, label: 'Weak', color: 'error' };
    if (strength < 70) return { strength, label: 'Fair', color: 'warning' };
    if (strength < 90) return { strength, label: 'Good', color: 'info' };
    return { strength, label: 'Strong', color: 'success' };
  }

  const passwordStrength = getPasswordStrength(newPassword);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !currentUser.email) return;

    // Validation
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto-clear success message
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('New password is too weak');
      } else {
        setPasswordError('Failed to update password: ' + err.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSendVerification() {
    console.log('📧 handleSendVerification called');
    if (!currentUser) {
      console.error('❌ No current user found');
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationError('');
      setVerificationSuccess('');

      console.log('📧 Sending verification email to:', currentUser.email);
      await sendEmailVerification(currentUser);
      console.log('✅ Verification email sent successfully');

      setVerificationSuccess('Verification email sent! Please check your inbox and spam folder.');
      
      // Auto-clear success message
      setTimeout(() => setVerificationSuccess(''), 10000);
    } catch (err: any) {
      console.error('❌ Error sending verification email:', err);
      if (err.code === 'auth/too-many-requests') {
        setVerificationError('Too many requests. Please try again later.');
      } else {
        setVerificationError('Failed to send verification email: ' + err.message);
      }
    } finally {
      setVerificationLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!currentUser || !currentUser.email) return;

    try {
      setDeleteLoading(true);
      setDeleteError('');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore
      try {
        // 1. Delete settings subcollection
        const settingsRef = collection(db, 'users', currentUser.uid, 'settings');
        const settingsSnapshot = await getDocs(settingsRef);
        
        const deletePromises = settingsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('✅ Deleted settings subcollection');

        // 2. Delete user document
        await deleteDoc(doc(db, 'users', currentUser.uid));
        console.log('✅ Deleted user document');
      } catch (err) {
        console.error('Error deleting Firestore data:', err);
      }

      // Delete user files from Storage
      try {
        const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
        const fileList = await listAll(storageRef);
        await Promise.all(fileList.items.map(item => deleteObject(item)));
      } catch (err) {
        console.error('Error deleting Storage files:', err);
      }

      // Delete Firebase Auth account
      await deleteUser(currentUser);

      // Logout and redirect
      await logout();
      navigate('/login');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setDeleteError('Password is incorrect');
      } else if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Please log out and log back in before deleting your account');
      } else {
        setDeleteError('Failed to delete account: ' + err.message);
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Account Security
        </Typography>
      </Box>

      {/* Change Password Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Change Password
        </Typography>

        {passwordError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{passwordError}</Alert>}
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{passwordSuccess}</Alert>}

        <Box component="form" onSubmit={handleChangePassword}>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            helperText="Minimum 6 characters"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {newPassword && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Password Strength:
                </Typography>
                <Typography variant="caption" color={`${passwordStrength.color}.main`} sx={{ fontWeight: 600 }}>
                  {passwordStrength.label}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={passwordStrength.strength} 
                color={passwordStrength.color as any}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={passwordLoading}
            startIcon={passwordLoading ? <CircularProgress size={20} /> : <LockIcon />}
            sx={{
              mt: 2,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Email Verification Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Email Verification
        </Typography>

        {verificationError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{verificationError}</Alert>}
        {verificationSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{verificationSuccess}</Alert>}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          {currentUser?.emailVerified ? (
            <Chip 
              icon={<VerifiedIcon />} 
              label="Verified" 
              color="success" 
              size="small"
            />
          ) : (
            <Chip 
              icon={<WarningIcon />} 
              label="Not Verified" 
              color="warning" 
              size="small"
            />
          )}
        </Box>

        {!currentUser?.emailVerified && (
          <Button
            variant="outlined"
            disabled={verificationLoading}
            startIcon={verificationLoading ? <CircularProgress size={20} /> : <VerifiedIcon />}
            onClick={handleSendVerification}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {verificationLoading ? 'Sending...' : 'Send Verification Email'}
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Delete Account Section */}
      <Box 
        sx={{ 
          p: 3, 
          border: '2px solid',
          borderColor: 'error.main',
          borderRadius: 2,
          bgcolor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(211, 47, 47, 0.1)' 
            : 'rgba(211, 47, 47, 0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
            Danger Zone
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Once you delete your account, there is no going back. This will permanently delete your profile, photos, and all associated data.
        </Typography>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={() => setDeleteDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Delete My Account
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            This action cannot be undone. All your data including profile information, photos, and settings will be permanently deleted.
          </DialogContentText>

          {deleteError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{deleteError}</Alert>}

          <TextField
            fullWidth
            type="password"
            label="Enter your password to confirm"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            margin="normal"
            required
            disabled={deleteLoading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteLoading || !deletePassword}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteForeverIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
