import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is admin, redirect to admin dashboard
    if (user && user.role === 'admin') {
      console.log('🔐 Admin user detected, redirecting to admin dashboard');
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // Don't render dashboard for admins
  if (user && user.role === 'admin') {
    return null;
  }

  return <Dashboard user={user || { username: 'User'}} onLogout={logout} />;
}
