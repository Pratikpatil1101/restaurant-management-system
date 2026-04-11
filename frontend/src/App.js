import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppLayout from "./components/AppLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function ProtectedRoutes() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/" replace />;
}

function PublicRoutes() {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function RoleRoute({ allowedRoles }) {
  const { role } = useAuth();
  return allowedRoles.includes(normalizeRole(role)) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function Shell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoutes />}>
              <Route path="/" element={<Login />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route element={<Shell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/menu" element={<Menu />} />
                <Route element={<RoleRoute allowedRoles={["admin", "waiter"]} />}>
                  <Route path="/cart" element={<Cart />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              color: "#e2e8f0",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              backdropFilter: "blur(12px)"
            }
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
