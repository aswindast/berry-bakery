import { ArrowRight } from 'lucide-react'
import { Link, Route, Routes } from 'react-router-dom'
import DesignSystemPage from './pages/DesignSystemPage'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CustomCakePage from './pages/CustomCakePage'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages'
import { AccountPage, ProfilePage, AddressesPage } from './pages/AccountPages'
import { OrdersPage, OrderDetailsPage, OrderSuccessPage } from './pages/OrderPages'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './layouts/AppShell'
import { AdminGuard } from './auth/AdminGuard'
import { AdminDashboardPage, AdminOrdersPage, AdminOrderDetailsPage, AdminProductsPage, AdminHighlightsPage, AdminCakeRequestsPage, AdminCustomersPage, AdminCouponsPage, AdminReviewsPage, AdminSettingsPage } from './pages/AdminPages'
import { CustomerCakeRequestsPage, CustomerCakeRequestDetailsPage } from './pages/CustomerCakeRequestsPage'
import { AboutPage, ContactPage, DeliveryPickupPage, FAQPage } from './pages/PublicInfoPages'

function PlaceholderPage({ title, message }: { title: string; message: string }) {
  return <div className="grid min-h-[55vh] place-items-center bg-berry-cream px-6 text-center"><div><p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-berry-pink">BERRY / Coming soon</p><h1 className="font-serif text-5xl text-berry-deep">{title}</h1><p className="mx-auto mt-4 max-w-md text-base leading-7 text-berry-muted">{message}</p><Link to="/" className="mt-8 inline-flex items-center gap-2 font-semibold text-berry-deep">Back home <ArrowRight size={16} /></Link></div></div>
}

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/menu/:slug" element={<ProductDetailsPage />} />
    <Route path="/custom-cakes" element={<CustomCakePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/admin" element={<AdminGuard />}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="highlights" element={<AdminHighlightsPage />} />
      <Route path="custom-cake-requests" element={<AdminCakeRequestsPage />} />
      <Route path="customers" element={<AdminCustomersPage />} />
      <Route path="coupons" element={<AdminCouponsPage />} />
      <Route path="reviews" element={<AdminReviewsPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Route>
    <Route element={<RequireAuth />}>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/success/:id" element={<OrderSuccessPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/account/profile" element={<ProfilePage />} />
      <Route path="/account/orders" element={<OrdersPage />} />
      <Route path="/account/orders/:id" element={<OrderDetailsPage />} />
      <Route path="/account/custom-cake-requests" element={<CustomerCakeRequestsPage />} />
      <Route path="/account/custom-cake-requests/:id" element={<CustomerCakeRequestDetailsPage />} />
      <Route path="/account/addresses" element={<AddressesPage />} />
    </Route>
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/search" element={<AppShell><PlaceholderPage title="Search BERRY." message="Search will connect to the product catalog in a future phase." /></AppShell>} />
    <Route path="/delivery-pickup" element={<DeliveryPickupPage />} />
    <Route path="/faq" element={<FAQPage />} />
    <Route path="/design-system" element={<DesignSystemPage />} />
  </Routes>
}
