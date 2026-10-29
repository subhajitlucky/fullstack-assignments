import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { CartSheet } from './components/CartSheet.jsx';
import { PhoneFrame } from './components/PhoneFrame.jsx';
import { useAuth } from './lib/auth.jsx';
import { RestaurantsProvider } from './lib/restaurants.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RestaurantPage } from './pages/RestaurantPage.jsx';
import { VerifyPage } from './pages/VerifyPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('.phone-shell')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <RestaurantsProvider>
      <Outlet />
    </RestaurantsProvider>
  );
}

export default function App() {
  return (
    <PhoneFrame>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CartSheet />
    </PhoneFrame>
  );
}
