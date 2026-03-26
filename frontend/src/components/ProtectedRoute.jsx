/**
 * ProtectedRoute Component
 * Wrapper component that checks if user has a valid token before allowing access to protected pages
 * 
 * Features:
 * - Checks for JWT token in localStorage
 * - Redirects unauthenticated users to login page
 * - Renders children component if authentication is valid
 */

import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');

    // If no token, redirect to login page
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // If token exists, render the protected component
    return children;
}
