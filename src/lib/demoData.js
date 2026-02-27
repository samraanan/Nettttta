// נתוני Demo לבית ספר אחד - "בית ספר אופק"

export const DEMO_SCHOOL = {
    id: 'school_1',
    name: 'בית ספר אופק',
    address: 'רחוב הרצל 15, תל אביב',
    phone: '03-1234567',
    contactName: 'דוד כהן',
    contactEmail: 'david@ofek-school.co.il',
    googleSheetId: null,
    googleFormUrl: null,
    active: true
};

export const DEMO_LOCATIONS = {
    floors: [
        {
            id: 'ground',
            label: 'קומת קרקע',
            categories: [
                {
                    id: 'classrooms',
                    label: 'כיתות',
                    rooms: [
                        { id: 'room_a1', roomNumber: '001', label: "כיתה א'1" },
                        { id: 'room_a2', roomNumber: '002', label: "כיתה א'2" },
                        { id: 'room_b1', roomNumber: '003', label: "כיתה ב'1" },
                        { id: 'room_b2', roomNumber: '004', label: "כיתה ב'2" },
                        { id: 'room_c1', roomNumber: '005', label: "כיתה ג'1" },
                        { id: 'room_c2', roomNumber: '006', label: "כיתה ג'2" }
                    ]
                },
                {
                    id: 'labs',
                    label: 'מעבדות',
                    rooms: [
                        { id: 'lab_computers', roomNumber: '007', label: 'מעבדת מחשבים' },
                        { id: 'lab_science', roomNumber: '008', label: 'מעבדת מדעים' }
                    ]
                },
                {
                    id: 'offices',
                    label: 'משרדים',
                    rooms: [
                        { id: 'office_principal', roomNumber: '009', label: 'משרד מנהל' },
                        { id: 'office_vp', roomNumber: '010', label: 'משרד סגן מנהל' },
                        { id: 'teachers_lounge', roomNumber: '011', label: 'חדר מורים' },
                        { id: 'office_secretary', roomNumber: '012', label: 'מזכירות' }
                    ]
                },
                {
                    id: 'common',
                    label: 'חללים משותפים',
                    rooms: [
                        { id: 'library', roomNumber: '013', label: 'ספרייה' },
                        { id: 'cafeteria', roomNumber: '014', label: 'חדר אוכל' },
                        { id: 'gym', roomNumber: '015', label: 'אולם ספורט' },
                        { id: 'auditorium', roomNumber: '016', label: 'אולם כנסים' }
                    ]
                }
            ]
        },
        {
            id: 'floor_1',
            label: 'קומה 1',
            categories: [
                {
                    id: 'classrooms',
                    label: 'כיתות',
                    rooms: [
                        { id: 'room_d1', roomNumber: '101', label: "כיתה ד'1" },
                        { id: 'room_d2', roomNumber: '102', label: "כיתה ד'2" },
                        { id: 'room_e1', roomNumber: '103', label: "כיתה ה'1" },
                        { id: 'room_e2', roomNumber: '104', label: "כיתה ה'2" },
                        { id: 'room_f1', roomNumber: '105', label: "כיתה ו'1" },
                        { id: 'room_f2', roomNumber: '106', label: "כיתה ו'2" }
                    ]
                },
                {
                    id: 'labs',
                    label: 'מעבדות',
                    rooms: [
                        { id: 'lab_robotics', roomNumber: '107', label: 'מעבדת רובוטיקה' },
                        { id: 'lab_art', roomNumber: '108', label: 'חדר אמנות' }
                    ]
                },
                {
                    id: 'offices',
                    label: 'משרדים',
                    rooms: [
                        { id: 'office_counselor', roomNumber: '109', label: 'משרד יועצת' },
                        { id: 'meeting_room', roomNumber: '110', label: 'חדר ישיבות' },
                        { id: 'office_special_ed', roomNumber: '111', label: 'משרד חינוך מיוחד' }
                    ]
                },
                {
                    id: 'infra',
                    label: 'תשתיות',
                    rooms: [
                        { id: 'server_room', roomNumber: '112', label: 'חדר שרתים' },
                        { id: 'network_closet', roomNumber: '113', label: 'ארון תקשורת' }
                    ]
                }
            ]
        }
    ]
};

export const DEMO_CATEGORIES = [
    { value: 'hardware', label: 'חומרה', icon: 'Monitor' },
    { value: 'software', label: 'תוכנה', icon: 'Code' },
    { value: 'network', label: 'רשת', icon: 'Wifi' },
    { value: 'security', label: 'אבטחה', icon: 'Shield' },
    { value: 'printer', label: 'מדפסות', icon: 'Printer' },
    { value: 'other', label: 'אחר', icon: 'HelpCircle' }
];
