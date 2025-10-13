import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ThemeLoadingScreen } from "@/components/ui/theme-loading-screen";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import Billing from "@/pages/Billing";
import Customers from "@/pages/Customers";
import Suppliers from "@/pages/Suppliers";
import Returns from "@/pages/Returns";
import Reports from "@/pages/Reports";
import SalesReport from "@/pages/reports/SalesReport";
import InventoryReport from "@/pages/reports/InventoryReport";
import TaxReport from "@/pages/reports/TaxReport";
import LabelsAndBarcodes from "@/pages/LabelsAndBarcodes";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Aboutus from "./pages/Aboutus";
import Contactus from "./pages/Contactus";
import AuthCallback from "@/pages/AuthCallback";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="stockify-theme">
      <AuthProvider>
        <ThemeLoadingScreen />
        <Router>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Routes>
              {/* Public routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<Aboutus />} />
              <Route path="/contact" element={<Contactus />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute>
                    <Suppliers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/returns"
                element={
                  <ProtectedRoute>
                    <Returns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/sales"
                element={
                  <ProtectedRoute>
                    <SalesReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/inventory"
                element={
                  <ProtectedRoute>
                    <InventoryReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/tax"
                element={
                  <ProtectedRoute>
                    <TaxReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labels-barcodes"
                element={
                  <ProtectedRoute>
                    <LabelsAndBarcodes />
                  </ProtectedRoute>
                }
              />
              {/* Redirect old routes to new combined page */}
              <Route
                path="/barcode"
                element={<Navigate to="/labels-barcodes" replace />}
              />
              <Route
                path="/labels"
                element={<Navigate to="/labels-barcodes" replace />}
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Redirect /app to /dashboard for authenticated users */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
