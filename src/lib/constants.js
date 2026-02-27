// === תפקידים ===
export const ROLES = {
    TECH_MANAGER: 'tech_manager',
    TECHNICIAN: 'technician',
    SCHOOL_ADMIN: 'school_admin',
    CLIENT: 'client'
};

export const ROLE_LABELS = {
    [ROLES.TECH_MANAGER]: 'מנהל טכנאים',
    [ROLES.TECHNICIAN]: 'טכנאי',
    [ROLES.SCHOOL_ADMIN]: 'מנהל בית ספר',
    [ROLES.CLIENT]: 'לקוח'
};

// === Route prefix לכל role ===
export const ROLE_HOME = {
    [ROLES.TECH_MANAGER]: '/manager',
    [ROLES.TECHNICIAN]: '/technician',
    [ROLES.SCHOOL_ADMIN]: '/school',
    [ROLES.CLIENT]: '/client'
};

// === סטטוסים ===
export const STATUS = {
    NEW: 'new',
    IN_PROGRESS: 'in_progress',
    WAITING: 'waiting',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
};

export const STATUS_LABELS = {
    [STATUS.NEW]: 'התקבל',
    [STATUS.IN_PROGRESS]: 'בטיפול',
    [STATUS.WAITING]: 'ממתין',
    [STATUS.RESOLVED]: 'הושלם',
    [STATUS.CLOSED]: 'סגור'
};

export const STATUS_COLORS = {
    [STATUS.NEW]: 'bg-slate-100 text-slate-700',
    [STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [STATUS.WAITING]: 'bg-amber-100 text-amber-700',
    [STATUS.RESOLVED]: 'bg-emerald-100 text-emerald-700',
    [STATUS.CLOSED]: 'bg-purple-100 text-purple-700'
};

// === דחיפויות ===
export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

export const PRIORITY_LABELS = {
    [PRIORITY.LOW]: 'נמוכה',
    [PRIORITY.MEDIUM]: 'בינונית',
    [PRIORITY.HIGH]: 'גבוהה',
    [PRIORITY.URGENT]: 'קריטית'
};

export const PRIORITY_COLORS = {
    null: 'bg-gray-100 text-gray-500',
    [PRIORITY.LOW]: 'bg-green-100 text-green-700',
    [PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-700',
    [PRIORITY.HIGH]: 'bg-orange-100 text-orange-700',
    [PRIORITY.URGENT]: 'bg-red-100 text-red-700'
};

// === קטגוריות ברירת מחדל ===
export const DEFAULT_CATEGORIES = [
    { value: 'hardware', label: 'חומרה', icon: 'Monitor' },
    { value: 'software', label: 'תוכנה', icon: 'Code' },
    { value: 'network', label: 'רשת', icon: 'Wifi' },
    { value: 'security', label: 'אבטחה', icon: 'Shield' },
    { value: 'printer', label: 'מדפסות', icon: 'Printer' },
    { value: 'other', label: 'אחר', icon: 'HelpCircle' }
];

// === קטגוריות מלאי ===
export const INVENTORY_CATEGORIES = [
    { value: 'cables', label: 'כבלים' },
    { value: 'peripherals', label: 'ציוד היקפי' },
    { value: 'components', label: 'רכיבים' },
    { value: 'consumables', label: 'מתכלים' },
    { value: 'other', label: 'אחר' }
];
