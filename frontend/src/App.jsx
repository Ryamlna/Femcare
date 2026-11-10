import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import AnimatedBackground from './components/AnimatedBackground.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MedicalReport from './pages/MedicalReport.jsx';
import HealthLibrary from './pages/HealthLibrary.jsx';

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center text-amethyst-300" role="status" aria-live="polite">
      Memuat…
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="report" element={<MedicalReport />} />
          <Route path="library" element={<HealthLibrary />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}