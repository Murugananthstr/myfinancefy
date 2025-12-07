import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import MainLayout from './components/Layout/MainLayout';
import PlaceholderPage from './pages/PlaceholderPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import { NotificationProvider } from './contexts/NotificationContext';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/reports/sales" element={<PlaceholderPage title="Sales Reports" />} />
                <Route path="/reports/traffic" element={<PlaceholderPage title="Traffic Reports" />} />
                <Route path="/management/users" element={<PlaceholderPage title="User Management" />} />
                <Route path="/management/roles" element={<PlaceholderPage title="Role Management" />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
