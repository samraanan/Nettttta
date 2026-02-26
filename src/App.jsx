import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import { ROLES, ROLE_HOME } from './lib/constants';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

// Dashboards
import { ManagerDashboard } from './components/tech-manager/ManagerDashboard';
import { TechDashboard } from './components/technician/TechDashboard';
import { SchoolDashboard } from './components/school-admin/SchoolDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthChange((userData) => {
            setUser(userData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Login */}
                <Route path="/login" element={
                    !loading && user
                        ? <Navigate to={ROLE_HOME[user.role] || '/'} replace />
                        : <LoginPage />
                } />

                {/* מנהל טכנאים */}
                <Route path="/manager" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECH_MANAGER]}>
                        <AppLayout user={user}><ManagerDashboard user={user} /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/manager/calls" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECH_MANAGER]}>
                        <AppLayout user={user}><PlaceholderPage title="כל הפניות" description="צפייה וסינון בכל הפניות מכל בתי הספר" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/manager/calls/:callId" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECH_MANAGER]}>
                        <AppLayout user={user}><PlaceholderPage title="פרטי פנייה" description="פרטי פנייה + היסטוריה" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/manager/reports" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECH_MANAGER]}>
                        <AppLayout user={user}><PlaceholderPage title="דוחות" description="סטטיסטיקות ודוחות חוצי בתי ספר" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/manager/inventory" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECH_MANAGER]}>
                        <AppLayout user={user}><PlaceholderPage title="מלאי ציוד" description="ניהול מלאי ציוד" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/manager/schools" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECH_MANAGER]}>
                        <AppLayout user={user}><PlaceholderPage title="הגדרות בתי ספר" description="ניהול בתי ספר, מיקומים וקטגוריות" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/manager/schools/:schoolId" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECH_MANAGER]}>
                        <AppLayout user={user}><PlaceholderPage title="הגדרות בית ספר" description="מיקומים, קטגוריות והגדרות" /></AppLayout>
                    </ProtectedRoute>
                } />

                {/* טכנאי */}
                <Route path="/technician" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECHNICIAN]}>
                        <AppLayout user={user}><TechDashboard user={user} /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/technician/calls" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECHNICIAN]}>
                        <AppLayout user={user}><PlaceholderPage title="פניות" description="כל הפניות מכל בתי הספר" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/technician/call/:callId" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECHNICIAN]}>
                        <AppLayout user={user}><PlaceholderPage title="פרטי פנייה" description="פרטי פנייה + היסטוריה" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/technician/clock" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.TECHNICIAN]}>
                        <AppLayout user={user}><PlaceholderPage title="כניסה/יציאה" description="מעקב שעות בבתי הספר" /></AppLayout>
                    </ProtectedRoute>
                } />

                {/* מנהל בית ספר */}
                <Route path="/school" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.SCHOOL_ADMIN]}>
                        <AppLayout user={user}><SchoolDashboard user={user} /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/school/calls" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.SCHOOL_ADMIN]}>
                        <AppLayout user={user}><PlaceholderPage title="פניות בית הספר" description="צפייה בפניות בית הספר" /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/school/reports" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.SCHOOL_ADMIN]}>
                        <AppLayout user={user}><PlaceholderPage title="דוחות" description="דוחות ברמת בית ספר" /></AppLayout>
                    </ProtectedRoute>
                } />

                {/* לקוח */}
                <Route path="/client" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.CLIENT]}>
                        <AppLayout user={user}><ClientDashboard user={user} /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/client/my-calls" element={
                    <ProtectedRoute user={user} loading={loading} allowedRoles={[ROLES.CLIENT]}>
                        <AppLayout user={user}><PlaceholderPage title="הפניות שלי" description="מעקב אחרי הפניות שלי" /></AppLayout>
                    </ProtectedRoute>
                } />

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
