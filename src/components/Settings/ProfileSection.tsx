import type React from 'react';
import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

interface ProfileSectionProps {
  profile: {
    displayName: string;
    email: string;
    photoURL: string | null;
  };
  onProfileUpdate: (updates: Partial<{ displayName: string; photoURL: string }>) => void;
}

export default function ProfileSection({ profile, onProfileUpdate }: ProfileSectionProps) {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photoURL);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}/avatar.jpg`);
      await uploadBytes(storageRef, file);

      // Get download URL
      const photoURL = await getDownloadURL(storageRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL: photoURL,
        updatedAt: serverTimestamp()
      });

      // Update Firebase Auth profile
      await updateProfile(currentUser, { photoURL });

      onProfileUpdate({ photoURL });
      setSuccess('Profile photo updated successfully!');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to upload photo: ' + err.message);
      setPhotoPreview(profile.photoURL);
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName,
        updatedAt: serverTimestamp()
      });

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: displayName
      });

      onProfileUpdate({ displayName });
      setSuccess('Profile updated successfully!');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Profile Information
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

      {/* Profile Photo Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={photoPreview || undefined}
            sx={{
              width: 120,
              height: 120,
              fontSize: '3rem',
              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <IconButton
            component="label"
            disabled={uploading}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              boxShadow: 2,
            }}
          >
            {uploading ? <CircularProgress size={24} color="inherit" /> : <PhotoCameraIcon />}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Click the camera icon to upload a new photo
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Maximum file size: 5MB
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Profile Form */}
      <Box component="form" onSubmit={handleSaveProfile}>
        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <TextField
          fullWidth
          label="Email Address"
          value={profile.email}
          margin="normal"
          disabled
          helperText="Email cannot be changed directly. Contact support if needed."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <TextField
          fullWidth
          label="User ID"
          value={currentUser?.uid || ''}
          margin="normal"
          disabled
          helperText="Your unique user identifier"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            mt: 3,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
            },
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}
