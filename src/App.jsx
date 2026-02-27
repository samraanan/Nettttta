import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import { ROLES, ROLE_HOME } from './lib/constants';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';

// Tech Manager
import { ManagerDashboard } from './components/tech-manager/ManagerDashboard';
import { ReportsView } from './components/tech-manager/ReportsView';
import { InventoryManager } from './components/tech-manager/InventoryManager';
import { SchoolSettings } from './components/tech-manager/SchoolSettings';
import { SchoolSetup } from './components/tech-manager/SchoolSetup';
import { NewSchoolWizard } from './components/tech-manager/NewSchoolWizard';
import { UserManager } from './components/tech-manager/UserManager';

// Technician
import { TechDashboard } from './components/technician/TechDashboard';
import { AllCallsList } from './components/technician/AllCallsList';
import { CallDetailView } from './components/technician/CallDetailView';
import { ClockInOut } from './components/technician/ClockInOut';

// School Admin
import { SchoolDashboard } from './components/school-admin/SchoolDashboard';
import { SchoolCallsView } from './components/school-admin/SchoolCallsView';
import { SchoolReports } from './components/school-admin/SchoolReports';

// Client
import { NewCallForm } from './components/client/NewCallForm';
import { MyCallsView } from './components/client/MyCallsView';

// Shared
import { RoomHistoryView } from './components/shared/RoomHistoryView';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewRole, setViewRole] = useState(null); // null = use user.role

    useEffect(() => {
        const unsubscribe = authService.onAuthChange((userData) => {
            setUser(userData);
            setViewRole(null); // reset view when user changes
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const effectiveViewRole = viewRole || user?.role;

    const protect = (component, routeOwnerRole) => (
        <ProtectedRoute user={user} loading={loading} routeOwnerRole={routeOwnerRole}>
            <AppLayout user={user} viewRole={effectiveViewRole} setViewRole={setViewRole}>
                {component}
            </AppLayout>
        </ProtectedRoute>
    );

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
                <Route path="/manager" element={protect(<ManagerDashboard user={user} />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/calls" element={protect(<AllCallsList user={user} linkPrefix="/manager/calls" />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/calls/:callId" element={protect(<CallDetailView user={user} canEditStatus canEditPriority canAddNotes />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/reports" element={protect(<ReportsView user={user} />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/inventory" element={protect(<InventoryManager user={user} />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/schools" element={protect(<SchoolSettings user={user} />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/schools/new" element={protect(<NewSchoolWizard user={user} />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/schools/:schoolId" element={protect(<SchoolSetup user={user} />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/room-history" element={protect(<RoomHistoryView user={user} linkPrefix="/manager/calls" />, ROLES.TECH_MANAGER)} />
                <Route path="/manager/users" element={protect(<UserManager user={user} />, ROLES.TECH_MANAGER)} />

                {/* טכנאי */}
                <Route path="/technician" element={protect(<TechDashboard user={user} />, ROLES.TECHNICIAN)} />
                <Route path="/technician/calls" element={protect(<AllCallsList user={user} linkPrefix="/technician/call" />, ROLES.TECHNICIAN)} />
                <Route path="/technician/call/:callId" element={protect(<CallDetailView user={user} canEditStatus canEditPriority canAddNotes />, ROLES.TECHNICIAN)} />
                <Route path="/technician/clock" element={protect(<ClockInOut user={user} />, ROLES.TECHNICIAN)} />
                <Route path="/technician/room-history" element={protect(<RoomHistoryView user={user} linkPrefix="/technician/call" />, ROLES.TECHNICIAN)} />

                {/* מנהל בית ספר */}
                <Route path="/school" element={protect(<SchoolDashboard user={user} />, ROLES.SCHOOL_ADMIN)} />
                <Route path="/school/calls" element={protect(<SchoolCallsView user={user} />, ROLES.SCHOOL_ADMIN)} />
                <Route path="/school/call/:callId" element={protect(<CallDetailView user={user} canEditStatus={false} canEditPriority canAddNotes={false} />, ROLES.SCHOOL_ADMIN)} />
                <Route path="/school/reports" element={protect(<SchoolReports user={user} />, ROLES.SCHOOL_ADMIN)} />

                {/* פונה — נגיש לכל מי שמורשה (לפי CAN_VIEW_AS) */}
                <Route path="/client" element={protect(<NewCallForm user={user} />, ROLES.CLIENT)} />
                <Route path="/client/my-calls" element={protect(<MyCallsView user={user} />, ROLES.CLIENT)} />

                {/* Default */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
