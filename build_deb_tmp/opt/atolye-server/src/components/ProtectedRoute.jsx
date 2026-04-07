import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children, userType }) => {
  const { user, userType: currentUserType, isAuthenticated, checkUserStatus, logout } = useAuthStore();

  // Suspended kontrolü
  useEffect(() => {
    if (isAuthenticated && user) {
      // Kullanıcının suspended olup olmadığını kontrol et
      if (user.suspended) {
        logout();
        window.location.href = '/';
      }
    }
  }, [user, isAuthenticated]);

  if (!isAuthenticated || !user) {
    return <Navigate to={userType === 'teacher' ? '/ogretmen/giris' : '/ogrenci/giris'} replace />;
  }

  // Suspended kontrolü
  if (user.suspended) {
    logout();
    return <Navigate to="/" replace />;
  }

  if (currentUserType !== userType) {
    return <Navigate to={currentUserType === 'teacher' ? '/ogretmen/panel' : '/ogrenci/panel'} replace />;
  }

  return children;
};

