import React from 'react';
import { cn } from '../lib/utils';
import { User, Shield, GraduationCap, Calculator } from 'lucide-react';

export function SimulationBar({ currentRole, onRoleChange }) {
    const roles = [
        { id: 'student', label: 'תצוגת תלמיד', icon: User, color: 'text-blue-500' },
        { id: 't1', label: 'תצוגת מורה (חשבון)', icon: GraduationCap, color: 'text-purple-500' },
        { id: 't5', label: 'תצוגת מורה (מדעים)', icon: Calculator, color: 'text-green-500' }, // t5 is science teacher in mock data
        { id: 'admin', label: 'תצוגת מחנך / הורה', icon: Shield, color: 'text-red-500' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t p-2 z-50 flex items-center justify-around shadow-2xl safe-area-bottom">
            {roles.map((role) => {
                const Icon = role.icon;
                const isActive = currentRole === role.id;

                return (
                    <button
                        key={role.id}
                        onClick={() => onRoleChange(role.id)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px]",
                            isActive ? "bg-secondary scale-105" : "opacity-60 hover:opacity-100"
                        )}
                    >
                        <Icon className={cn("w-5 h-5", role.color)} />
                        <span className="text-[10px] font-medium">{role.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
