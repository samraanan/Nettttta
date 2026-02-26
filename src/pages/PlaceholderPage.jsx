import { Construction } from 'lucide-react';

export function PlaceholderPage({ title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                <Construction className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description || 'הדף בפיתוח...'}</p>
            </div>
        </div>
    );
}
