import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import BuyerLandingPage from './pages/BuyerLandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FactoriesPage from './pages/FactoriesPage';
import FactoryDetailPage from './pages/FactoryDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Buyer Pages
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import OrdersPage from './pages/buyer/OrdersPage';
import OrderDetailPage from './pages/buyer/OrderDetailPage';
import PaymentResultPage from './pages/buyer/PaymentResultPage';
import RecommendationsPage from './pages/buyer/RecommendationsPage';

// Shared Pages
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';

// Factory Dashboard
import FactoryDashboard from './pages/factory/FactoryDashboard';
import FactoryProducts from './pages/factory/FactoryProducts';
import FactoryOrders from './pages/factory/FactoryOrders';
import FactoryReports from './pages/factory/FactoryReports';
import FactoryApprovalPage from './pages/factory/FactoryApprovalPage';

// Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFactories from './pages/admin/AdminFactories';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCategories from './pages/admin/AdminCategories';

// Guards
const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role))
    return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ApprovedFactoryRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'FACTORY') return <Navigate to="/" replace />;
  if (user.approval_status !== 'APPROVED')
    return <Navigate to="/factory/pending" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/buyer"
          element={
            <ProtectedRoute roles={['BUYER']}>
              <BuyerLandingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/factories" element={<FactoriesPage />} />
        <Route path="/factories/:id" element={<FactoryDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Buyer routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={['BUYER']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute roles={['BUYER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={['BUYER']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute roles={['BUYER']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/result"
          element={
            <ProtectedRoute roles={['BUYER']}>
              <PaymentResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute roles={['BUYER']}>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory/pending"
          element={
            <ProtectedRoute roles={['FACTORY']}>
              <FactoryApprovalPage />
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Factory Dashboard */}
      <Route
        path="/factory"
        element={
          <ApprovedFactoryRoute>
            <DashboardLayout role="FACTORY" />
          </ApprovedFactoryRoute>
        }
      >
        <Route index element={<FactoryDashboard />} />
        <Route path="products" element={<FactoryProducts />} />
        <Route path="orders" element={<FactoryOrders />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="reports" element={<FactoryReports />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <DashboardLayout role="ADMIN" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="factories" element={<AdminFactories />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
