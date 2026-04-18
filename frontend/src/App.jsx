import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutLogger from './pages/WorkoutLogger';
import NutritionTracker from './pages/NutritionTracker';
import Progress from './pages/Progress';
import Goals from './pages/Goals';
import BodyStats from './pages/BodyStats';
import Calculator from './pages/Calculator';
import Guides from './pages/Guides';
import Photos from './pages/Photos';
import Coach from './pages/Coach';
import Mobility from './pages/Mobility';
import Settings from './pages/Settings';
import MentalHealth from './pages/MentalHealth';
import Prenatal from './pages/Prenatal';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login"        element={!user ? <Login />    : <Navigate to="/" replace />} />
        <Route path="/register"     element={!user ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/"             element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/workouts"     element={<PrivateRoute><WorkoutLogger /></PrivateRoute>} />
        <Route path="/nutrition"    element={<PrivateRoute><NutritionTracker /></PrivateRoute>} />
        <Route path="/progress"     element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/goals"        element={<PrivateRoute><Goals /></PrivateRoute>} />
        <Route path="/body-stats"   element={<PrivateRoute><BodyStats /></PrivateRoute>} />
        <Route path="/calculator"   element={<PrivateRoute><Calculator /></PrivateRoute>} />
        <Route path="/guides"       element={<PrivateRoute><Guides /></PrivateRoute>} />
        <Route path="/photos"       element={<PrivateRoute><Photos /></PrivateRoute>} />
        <Route path="/coach"        element={<PrivateRoute><Coach /></PrivateRoute>} />
        <Route path="/mobility"     element={<PrivateRoute><Mobility /></PrivateRoute>} />
        <Route path="/settings"     element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/mental-health" element={<PrivateRoute><MentalHealth /></PrivateRoute>} />
        <Route path="/prenatal"     element={<PrivateRoute><Prenatal /></PrivateRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// Hide bottom nav when iOS keyboard opens so it doesn't float awkwardly
function useKeyboardDetection() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const keyboardOpen = (window.innerHeight - vv.height) > 150;
      document.body.classList.toggle('keyboard-open', keyboardOpen);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);
}

export default function App() {
  useKeyboardDetection();
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <PreferencesProvider>
              <AppRoutes />
            </PreferencesProvider>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
