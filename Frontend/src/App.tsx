import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExternalLayout } from './layouts/external/ExternalLayout';
import { InternalLayout } from './layouts/internal/InternalLayout';

// Domain-driven external pages
import { HomePage } from './pages/external/home';
import { ProductsPage } from './pages/external/product';
import { ProductDetailPage } from './pages/external/product/detail';
import { PcBuilderPage } from './pages/external/product/builder';
import { ComparePage } from './pages/external/product/compare';
import { CartPage } from './pages/external/cart';
import { CheckoutPage } from './pages/external/cart/checkout';
import { MePage } from './pages/external/me';
import { WishlistPage } from './pages/external/wishlist';
import { SupportPage } from './pages/external/support';
import { WarrantyPage } from './pages/external/warranty';

// Internal admin pages
import { DashboardPage } from './pages/internal/dashboard';
import { InternalLoginPage } from './pages/internal/login';
import AdminProductsPage from './pages/internal/products';
import AdminOrdersPage from './pages/internal/orders';
import AdminVouchersPage from './pages/internal/vouchers';
import AdminWarrantyPage from './pages/internal/warranty';
import AdminCustomersPage from './pages/internal/customers';
import AdminReviewsPage from './pages/internal/reviews';
import TrendsPage from './pages/internal/trends';
import ManufacturersPage from './pages/internal/manufacturers';
import BrandsPage from './pages/internal/brands';
import EmployeesPage from './pages/internal/employees';
import SettingsPage from './pages/internal/settings';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ExternalLayout />}>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Product Catalog, Search & Features */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/search" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/build-pc" element={<PcBuilderPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />

          {/* Customer Support & Policies */}
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/:topic" element={<SupportPage />} />

          {/* Cart & Checkout */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cart/checkout" element={<CheckoutPage />} />

          {/* User Account & Orders */}
          <Route path="/me" element={<MePage />} />
        </Route>

        <Route path="/internal/login" element={<InternalLoginPage />} />

        {/* Admin Dashboard */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="/internal" element={<InternalLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="trends" element={<TrendsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="manufacturers" element={<ManufacturersPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="warranty" element={<AdminWarrantyPage />} />
            <Route path="vouchers" element={<AdminVouchersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
