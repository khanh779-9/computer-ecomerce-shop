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
import { DashboardPage } from './pages/internal/DashboardPage';
import { InternalTablePage } from './pages/internal/InternalTablePages';
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

        {/* Admin Dashboard */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="/internal" element={<InternalLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<InternalTablePage title="Products" />} />
            <Route path="orders" element={<InternalTablePage title="Orders" />} />
            <Route path="vouchers" element={<InternalTablePage title="Vouchers" />} />
            <Route path="customers" element={<InternalTablePage title="Customers" />} />
            <Route path="reviews" element={<InternalTablePage title="Reviews" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
