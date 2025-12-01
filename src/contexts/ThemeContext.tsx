import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, PaletteMode } from '@mui/material';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Color schemes
export const colorSchemes = {
  purple: {
    primary: '#667eea',
    secondary: '#764ba2',
  },
  blue: {
    primary: '#2196f3',
    secondary: '#1976d2',
  },
  green: {
    primary: '#4caf50',
    secondary: '#388e3c',
  },
  orange: {
    primary: '#ff9800',
    secondary: '#f57c00',
  },
  pink: {
    primary: '#e91e63',
    secondary: '#c2185b',
  },
};

export type ColorScheme = keyof typeof colorSchemes;
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ThemeSettings {
  mode: PaletteMode;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  sidebarOpen: boolean;
}

interface ThemeContextType extends ThemeSettings {
  setMode: (mode: PaletteMode, save?: boolean) => void;
  setColorScheme: (scheme: ColorScheme, save?: boolean) => void;
  setFontSize: (size: FontSize, save?: boolean) => void;
  setSidebarOpen: (open: boolean, save?: boolean) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useThemeSettings() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within ThemeProvider');
  }
  return context;
}

const fontSizeMap = {
  small: 0.75,    // 12px base
  medium: 1,      // 16px base
  large: 1.25,    // 20px base
  xlarge: 1.5,    // 24px base
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentUser } = useAuth();
  const [mode, setModeState] = useState<PaletteMode>('light');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('purple');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load theme settings from Firestore
  useEffect(() => {
    async function loadThemeSettings() {
      try {
        // If user is logged in, load from Firestore
        if (currentUser) {
          const settingsDoc = await getDoc(doc(db, 'users', currentUser.uid, 'settings', 'preferences'));
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            setModeState(data.theme?.mode || 'light');
            setColorSchemeState(data.theme?.colorScheme || 'purple');
            setFontSizeState(data.theme?.fontSize || 'medium');
            setSidebarOpenState(data.sidebar?.defaultOpen !== false);
          } else {
            // Create default settings document if it doesn't exist
            await setDoc(
              doc(db, 'users', currentUser.uid, 'settings', 'preferences'),
              {
                theme: {
                  mode: 'light',
                  colorScheme: 'purple',
                  fontSize: 'medium',
                },
                sidebar: {
                  defaultOpen: true,
                },
                updatedAt: new Date(),
              }
            );
          }
        }
      } catch (err) {
        console.error('Error loading theme settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadThemeSettings();
  }, [currentUser]);

  // Save theme settings to Firestore
  async function saveSettings(settings: Partial<ThemeSettings>) {
    console.log('saveSettings called with:', settings);
    console.log('currentUser:', currentUser ? currentUser.uid : 'null');
    
    // Save to Firestore if user is logged in
    if (!currentUser) {
      console.warn('Cannot save settings: User not logged in');
      return;
    }

    try {
      // Get the current values from state or use the new values from settings parameter
      const currentMode = settings.mode ?? mode;
      const currentColorScheme = settings.colorScheme ?? colorScheme;
      const currentFontSize = settings.fontSize ?? fontSize;
      const currentSidebarOpen = settings.sidebarOpen ?? sidebarOpen;

      console.log('Attempting to save to Firestore:', {
        mode: currentMode,
        colorScheme: currentColorScheme,
        fontSize: currentFontSize,
        sidebarOpen: currentSidebarOpen,
      });

      await setDoc(
        doc(db, 'users', currentUser.uid, 'settings', 'preferences'),
        {
          theme: {
            mode: currentMode,
            colorScheme: currentColorScheme,
            fontSize: currentFontSize,
          },
          sidebar: {
            defaultOpen: currentSidebarOpen,
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );
      
      console.log('✅ Settings saved successfully to Firestore!');
    } catch (err: any) {
      console.error('❌ Error saving theme settings:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
    }
  }

  function setMode(newMode: PaletteMode, save = true) {
    console.log('🎨 setMode called:', newMode);
    setModeState(newMode);
    if (save) saveSettings({ mode: newMode });
  }

  function setColorScheme(scheme: ColorScheme, save = true) {
    console.log('🎨 setColorScheme called:', scheme);
    setColorSchemeState(scheme);
    if (save) saveSettings({ colorScheme: scheme });
  }

  function setFontSize(size: FontSize, save = true) {
    console.log('🎨 setFontSize called:', size);
    setFontSizeState(size);
    if (save) saveSettings({ fontSize: size });
  }

  function setSidebarOpen(open: boolean, save = true) {
    console.log('🎨 setSidebarOpen called:', open);
    setSidebarOpenState(open);
    if (save) saveSettings({ sidebarOpen: open });
  }

  function toggleMode() {
    setMode(mode === 'light' ? 'dark' : 'light');
  }

  // Create MUI theme based on settings
  // Apply font size to root element for global scaling
  useEffect(() => {
    const baseSize = 100; // 100% is default (usually 16px)
    const scale = fontSizeMap[fontSize];
    // We use percentage to respect user's browser settings
    document.documentElement.style.fontSize = `${baseSize * scale}%`;
  }, [fontSize]);

  // Create MUI theme based on settings
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: colorSchemes[colorScheme].primary,
      },
      secondary: {
        main: colorSchemes[colorScheme].secondary,
      },
    },
    // Typography is now handled by root font size scaling
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  }), [mode, colorScheme]);

  const value = {
    mode,
    colorScheme,
    fontSize,
    sidebarOpen,
    setMode,
    setColorScheme,
    setFontSize,
    setSidebarOpen,
    toggleMode,
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}
