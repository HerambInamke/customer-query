import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import MainLayout from './layout/MainLayout.jsx';
import Loader from './components/common/Loader.jsx';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const QueryList = lazy(() => import('./pages/QueryList.jsx'));
const CreateQuery = lazy(() => import('./pages/CreateQuery.jsx'));
const ViewQuery = lazy(() => import('./pages/ViewQuery.jsx'));
const EditQuery = lazy(() => import('./pages/EditQuery.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense 
          fallback={
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
          }
        >
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/queries" element={<QueryList />} />
                <Route path="/queries/create" element={<CreateQuery />} />
                <Route path="/queries/:id" element={<ViewQuery />} />
                <Route path="/queries/:id/edit" element={<EditQuery />} />
                
                {/* Default Redirect to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      {/* Global Notifications Toaster */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'toast-custom',
          duration: 3500,
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
          },
          success: {
            iconTheme: {
              primary: 'var(--text)',
              secondary: 'var(--bg-surface)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--text)',
              secondary: 'var(--bg-surface)',
            },
          },
        }} 
      />
    </AuthProvider>
  );
}

export default App;
