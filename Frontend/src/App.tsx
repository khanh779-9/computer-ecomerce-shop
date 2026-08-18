import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExternalLayout } from './layouts/external/ExternalLayout';
import { InternalLayout } from './layouts/internal/InternalLayout';
import { HomePage } from './pages/external/HomePage';
import { ProductDetailPage } from './pages/external/ProductDetailPage';
import { CheckoutPage } from './pages/external/CheckoutPage';
import { CartPage } from './pages/external/CartPage';
import { PcBuilderPage } from './pages/external/PcBuilderPage';
import { DashboardPage } from './pages/internal/DashboardPage';
import { InternalTablePage } from './pages/internal/InternalTablePages';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ExternalLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/build-pc" element={<PcBuilderPage />} />
        </Route>
        <Route path="/internal" element={<InternalLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<InternalTablePage title="Products" />} />
          <Route path="orders" element={<InternalTablePage title="Orders" />} />
          <Route path="customers" element={<InternalTablePage title="Customers" />} />
          <Route path="reviews" element={<InternalTablePage title="Reviews" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
