import { List, BarChart3, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SchoolDashboard({ user }) {
    const cards = [
        { to: '/school/calls', icon: List, label: 'פניות', desc: 'צפייה בפניות בית הספר', color: 'bg-blue-100 text-blue-700' },
        { to: '/school/reports', icon: BarChart3, label: 'דוחות', desc: 'דוחות ברמת בית ספר', color: 'bg-emerald-100 text-emerald-700' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">שלום, {user.displayName}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {user.schoolName ? `מנהל - ${user.schoolName}` : 'מנהל בית ספר'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map((card) => (
                    <Link
                        key={card.to}
                        to={card.to}
                        className="bg-card rounded-2xl border p-5 hover:shadow-md transition space-y-3"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{card.label}</h3>
                            <p className="text-sm text-muted-foreground">{card.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
