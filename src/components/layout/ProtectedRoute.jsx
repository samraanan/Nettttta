import { Navigate } from 'react-router-dom';
import { ROLE_HOME } from '../../lib/constants';

export function ProtectedRoute({ user, loading, allowedRoles, children }) {
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">טוען...</p>
                </div>
            </div>
        );
    }

    // לא מחובר → redirect ל-login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // מחובר אבל ניגש ל-route לא שלו → redirect ל-dashboard שלו
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const home = ROLE_HOME[user.role] || '/login';
        return <Navigate to={home} replace />;
    }

    return children;
}
