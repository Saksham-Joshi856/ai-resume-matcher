/**
 * App Component
 * Main application component with React Router configuration
 * Handles routing for Login, Signup, and Dashboard pages
 * 
 * Features:
 * - Public routes: Login, Signup
 * - Protected routes: Dashboard (requires authentication)
 * - Route protection using ProtectedRoute component
 */

import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes - Require valid JWT token */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
