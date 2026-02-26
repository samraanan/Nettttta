import { Monitor, Code, Wifi, Shield, Printer, HelpCircle } from 'lucide-react';

const ICONS = {
    Monitor, Code, Wifi, Shield, Printer, HelpCircle
};

const CATEGORY_ICON_MAP = {
    hardware: 'Monitor',
    software: 'Code',
    network: 'Wifi',
    security: 'Shield',
    printer: 'Printer',
    other: 'HelpCircle'
};

const CATEGORY_LABEL_MAP = {
    hardware: 'חומרה',
    software: 'תוכנה',
    network: 'רשת',
    security: 'אבטחה',
    printer: 'מדפסות',
    other: 'אחר'
};

export function CategoryIcon({ category, showLabel = false, className = 'w-4 h-4' }) {
    const iconName = CATEGORY_ICON_MAP[category] || 'HelpCircle';
    const Icon = ICONS[iconName] || HelpCircle;
    const label = CATEGORY_LABEL_MAP[category] || category;

    if (showLabel) {
        return (
            <span className="inline-flex items-center gap-1.5">
                <Icon className={className} />
                <span>{label}</span>
            </span>
        );
    }

    return <Icon className={className} />;
}

export function getCategoryLabel(category) {
    return CATEGORY_LABEL_MAP[category] || category;
}
