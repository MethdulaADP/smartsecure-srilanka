import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import FilesPage from './pages/FilesPage';
import SecurityPage from './pages/SecurityPage';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) {
    console.warn('⚠️ Unauthorized access attempt - No user logged in');
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    console.warn(`⚠️ Unauthorized access attempt - User ${user.username} (role: ${user.role}) tried to access admin area`);
    return <Navigate to="/dashboard" replace />;
  }
  console.log(`✅ Admin access granted for user: ${user.username}`);
  return children;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Layout */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated User Routes with AuthenticatedLayout */}
          <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>

          {/* Admin Routes (NO layout, standalone) */}
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
