import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import PaletteIcon from '@mui/icons-material/Palette';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import ProfileSection from '../components/Settings/ProfileSection';
import SecuritySection from '../components/Settings/SecuritySection';
import AppearanceSection from '../components/Settings/AppearanceSection';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  async function loadUserProfile() {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          displayName: data.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || '',
          email: data.email || currentUser.email || '',
          photoURL: data.photoURL || currentUser.photoURL || null
        });
      } else {
        // Document doesn't exist - create it for users who signed up before Firestore was added
        console.log('User document does not exist, creating it now...');
        const newUserData = {
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || '',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUserData);
        
        setProfile({
          displayName: newUserData.displayName,
          email: newUserData.email,
          photoURL: newUserData.photoURL
        });
        console.log('User document created successfully');
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      // Fallback to Firebase Auth data if Firestore fails
      setProfile({
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || '',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || null
      });
    } finally {
      setLoading(false);
    }
  }

  function handleProfileUpdate(updates: Partial<{ displayName: string; photoURL: string }>) {
    setProfile(prev => ({ ...prev, ...updates }));
  }

  function handleTabChange(_event: React.SyntheticEvent, newValue: number) {
    setTabValue(newValue);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              },
            }}
          >
            <Tab 
              icon={<PersonIcon />} 
              iconPosition="start" 
              label="Profile" 
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
            <Tab 
              icon={<LockIcon />} 
              iconPosition="start" 
              label="Security" 
              id="settings-tab-1"
              aria-controls="settings-tabpanel-1"
            />
            <Tab 
              icon={<PaletteIcon />} 
              iconPosition="start" 
              label="Appearance" 
              id="settings-tab-2"
              aria-controls="settings-tabpanel-2"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ p: 4 }}>
          <TabPanel value={tabValue} index={0}>
            <ProfileSection profile={profile} onProfileUpdate={handleProfileUpdate} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <SecuritySection />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <AppearanceSection />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}
