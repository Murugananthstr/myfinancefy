import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeSettings, colorSchemes, ColorScheme, FontSize } from '../../contexts/ThemeContext';

const fontSizeMarks = [
  { value: 0, label: 'Small' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'Large' },
  { value: 3, label: 'XLarge' },
];

const fontSizeValues: FontSize[] = ['small', 'medium', 'large', 'xlarge'];

export default function AppearanceSection() {
  const {
    mode,
    colorScheme,
    fontSize,
    sidebarOpen,
    setMode,
    setColorScheme,
    setFontSize,
    setSidebarOpen,
  } = useThemeSettings();

  const fontSizeIndex = fontSizeValues.indexOf(fontSize);



  return (
    <Box>
      {/* Debug Info */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Current Settings (Debug Info):
        </Typography>
        <Typography variant="body2">
          Mode: <strong>{mode}</strong> | 
          Color: <strong>{colorScheme}</strong> | 
          Font: <strong>{fontSize}</strong> | 
          Sidebar: <strong>{sidebarOpen ? 'Open' : 'Closed'}</strong>
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Appearance & Display
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Customize your experience! Changes are saved automatically and synced across your devices.
      </Alert>

      {/* Theme Mode Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Theme Mode
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_e, newMode) => newMode && setMode(newMode)}
          aria-label="theme mode"
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <ToggleButton value="light" aria-label="light mode">
            <LightModeIcon sx={{ mr: 1 }} />
            Light
          </ToggleButton>
          <ToggleButton value="dark" aria-label="dark mode">
            <DarkModeIcon sx={{ mr: 1 }} />
            Dark
          </ToggleButton>
          <ToggleButton value="system" aria-label="system mode" disabled>
            <SettingsBrightnessIcon sx={{ mr: 1 }} />
            System
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          System mode coming soon - will match your device settings
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Color Scheme Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Color Scheme
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 2 }}>
          {(Object.keys(colorSchemes) as ColorScheme[]).map((scheme) => (
            <Paper
              key={scheme}
              elevation={colorScheme === scheme ? 8 : 2}
              onClick={() => setColorScheme(scheme)}
              sx={{
                p: 2,
                cursor: 'pointer',
                textAlign: 'center',
                border: 2,
                borderColor: colorScheme === scheme ? 'primary.main' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: 60,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${colorSchemes[scheme].primary} 0%, ${colorSchemes[scheme].secondary} 100%)`,
                  mb: 1,
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {scheme}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Font Size Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormatSizeIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Font Size
          </Typography>
        </Box>
        <Box sx={{ px: 2 }}>
          <Slider
            value={fontSizeIndex}
            onChange={(_e, value) => {
              // Update state immediately but don't save to DB yet
              setFontSize(fontSizeValues[value as number], false);
            }}
            onChangeCommitted={(_e, value) => {
              // Save to DB when user stops dragging
              setFontSize(fontSizeValues[value as number], true);
            }}
            min={0}
            max={3}
            step={1}
            marks={fontSizeMarks}
            valueLabelDisplay="off"
            sx={{
              '& .MuiSlider-markLabel': {
                fontSize: '0.75rem',
              },
            }}
          />
        </Box>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Preview: This is how text will appear with your selected font size.
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Sidebar Preferences Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MenuIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Sidebar Preferences
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={sidebarOpen}
              onChange={(e) => setSidebarOpen(e.target.checked)}
              color="primary"
            />
          }
          label="Open sidebar by default on desktop"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 4 }}>
          This setting only affects desktop view. On mobile, the sidebar is always hidden by default.
        </Typography>
      </Box>

      {/* Preview Section */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${colorSchemes[colorScheme].primary} 0%, ${colorSchemes[colorScheme].secondary} 100%)`,
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Theme Preview
        </Typography>
        <Typography variant="body2">
          Your selected theme is being applied across the entire application. All buttons, headers, and accent colors will use your chosen color scheme.
        </Typography>
      </Box>
    </Box>
  );
}
