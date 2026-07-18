import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Loader from './Loader.jsx';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div 
        style={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)' 
        }}
      >
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
