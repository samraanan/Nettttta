import React from 'react';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export function DateNavigation({ date, onPrev, onNext, onToday, isToday = true }) {
    return (
        <div className="sticky top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-3 border-b shadow-sm">
            <div className="flex items-center justify-between max-w-md mx-auto">
                <button
                    onClick={onPrev}
                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-primary font-bold text-lg">
                        <span>{format(new Date(date), 'EEEE, d בMMMM', { locale: he })}</span>
                    </div>
                    {isToday && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            היום
                        </span>
                    )}
                    {!isToday && (
                        <button
                            onClick={() => window.location.href.includes('onToday') ? null : (typeof onToday === 'function' && onToday())}
                            className="text-xs font-medium text-primary hover:underline mt-1"
                        >
                            חזור להיום ←
                        </button>
                    )}
                </div>

                <button
                    onClick={onNext}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground disabled:opacity-30 active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
