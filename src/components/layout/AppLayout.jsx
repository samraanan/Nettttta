import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Menu, X, LogOut, Home, List, BarChart3,
    Package, Settings, Clock, Building2, Wrench, MapPin, Users
} from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../../lib/constants';
import { authService } from '../../services/authService';
import { cn } from '../../lib/utils';

const NAV_ITEMS = {
    [ROLES.TECH_MANAGER]: [
        { to: '/manager', icon: Home, label: 'ראשי', end: true },
        { to: '/manager/calls', icon: List, label: 'כל הפניות' },
        { to: '/manager/room-history', icon: MapPin, label: 'היסטוריית חדר' },
        { to: '/manager/reports', icon: BarChart3, label: 'דוחות' },
        { to: '/manager/inventory', icon: Package, label: 'מלאי ציוד' },
        { to: '/manager/schools', icon: Settings, label: 'בתי ספר' },
        { to: '/manager/users', icon: Users, label: 'משתמשים' },
    ],
    [ROLES.TECHNICIAN]: [
        { to: '/technician', icon: Home, label: 'ראשי', end: true },
        { to: '/technician/calls', icon: List, label: 'פניות' },
        { to: '/technician/room-history', icon: MapPin, label: 'היסטוריית חדר' },
        { to: '/technician/clock', icon: Clock, label: 'כניסה/יציאה' },
    ],
    [ROLES.SCHOOL_ADMIN]: [
        { to: '/school', icon: Home, label: 'ראשי', end: true },
        { to: '/school/calls', icon: List, label: 'פניות' },
        { to: '/school/reports', icon: BarChart3, label: 'דוחות' },
    ],
    [ROLES.CLIENT]: [
        { to: '/client', icon: Home, label: 'פנייה חדשה', end: true },
        { to: '/client/my-calls', icon: List, label: 'הפניות שלי' },
    ],
};

export function AppLayout({ user, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = NAV_ITEMS[user.role] || [];

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            {/* Mobile Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-muted transition"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm">ניהול IT</span>
                </div>
                <div className="w-9" />
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 right-0 z-50 h-full w-64 bg-white border-l border-border shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none lg:z-auto",
                sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            )}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Wrench className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-sm">ניהול טכנאי IT</h1>
                                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 rounded-lg hover:bg-muted transition lg:hidden"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-3 border-t border-border">
                        <div className="px-3 py-2 mb-2">
                            <p className="text-sm font-medium truncate">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            {user.schoolName && (
                                <div className="flex items-center gap-1 mt-1">
                                    <Building2 className="w-3 h-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">{user.schoolName}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            התנתק
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:mr-64 min-h-screen">
                <div className="max-w-5xl mx-auto p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
