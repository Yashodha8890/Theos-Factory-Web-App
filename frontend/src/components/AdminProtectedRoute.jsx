import { Navigate } from 'react-router-dom';

const readAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem('theos_admin_user'));
  } catch (error) {
    return null;
  }
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('theos_admin_token');
  const adminUser = readAdminUser();

  if (!token || adminUser?.role !== 'admin') {
    localStorage.removeItem('theos_admin_token');
    localStorage.removeItem('theos_admin_user');
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
