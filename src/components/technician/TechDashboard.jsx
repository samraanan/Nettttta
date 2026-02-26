import { List, Clock, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TechDashboard({ user }) {
    const cards = [
        { to: '/technician/calls', icon: List, label: 'פניות', desc: 'כל הפניות מכל בתי הספר', color: 'bg-blue-100 text-blue-700' },
        { to: '/technician/clock', icon: Clock, label: 'כניסה/יציאה', desc: 'מעקב שעות בבתי הספר', color: 'bg-amber-100 text-amber-700' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">שלום, {user.displayName}</h1>
                <p className="text-muted-foreground text-sm mt-1">טכנאי - לוח בקרה</p>
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
