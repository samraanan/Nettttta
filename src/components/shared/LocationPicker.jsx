import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export function LocationPicker({ locations, value, onChange }) {
    const [isMobileDevice, setIsMobileDevice] = useState(value?.isMobileDevice || false);
    const [barcode, setBarcode] = useState(value?.barcode || '');
    const [selectedFloor, setSelectedFloor] = useState(value?.floorId || '');
    const [selectedCategory, setSelectedCategory] = useState(value?.categoryId || '');
    const [selectedRoom, setSelectedRoom] = useState(value?.roomId || '');

    const floors = locations?.floors || [];

    const floor = floors.find(f => f.id === selectedFloor);
    const categories = floor?.categories || [];
    const category = categories.find(c => c.id === selectedCategory);
    const rooms = category?.rooms || [];
    const room = rooms.find(r => r.id === selectedRoom);

    useEffect(() => {
        if (isMobileDevice) {
            // Guard against infinite loops
            if (value?.isMobileDevice && value?.barcode === barcode) return;
            onChange({
                isMobileDevice: true,
                barcode: barcode,
                floorLabel: 'ציוד נייד',
                categoryLabel: 'כללי',
                roomLabel: 'ללא תמיכת חדר',
                roomNumber: barcode || 'לא סופק'
            });
        } else {
            if (room && floor && category) {
                if (value?.roomId === room.id && !value?.isMobileDevice) return;
                onChange({
                    isMobileDevice: false,
                    floorId: floor.id,
                    floorLabel: floor.label,
                    categoryId: category.id,
                    categoryLabel: category.label,
                    roomId: room.id,
                    roomNumber: room.roomNumber,
                    roomLabel: room.label
                });
            } else if (value) {
                // If they switch back from mobile to room picking but haven't finished selecting
                onChange(null);
            }
        }
    }, [selectedRoom, onChange, room, floor, category, value, isMobileDevice, barcode]);

    const handleFloorChange = (e) => {
        setSelectedFloor(e.target.value);
        setSelectedCategory('');
        setSelectedRoom('');
        onChange(null);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedRoom('');
        onChange(null);
    };

    const handleRoomChange = (e) => {
        setSelectedRoom(e.target.value);
    };

    const displayText = room && floor && category
        ? `${floor.label} > ${category.label} > ${room.label} (חדר ${room.roomNumber})`
        : null;

    return (
        <div className="space-y-4">
            {/* Toggle Switch for Location Type */}
            <div className="flex bg-muted p-1 rounded-xl">
                <button
                    type="button"
                    onClick={() => setIsMobileDevice(false)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isMobileDevice ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    מיקום פיזי (כיתה/משרד)
                </button>
                <button
                    type="button"
                    onClick={() => setIsMobileDevice(true)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isMobileDevice ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    ציוד נייד (מחשב/אייפד)
                </button>
            </div>

            {/* Content Based on Toggle */}
            {isMobileDevice ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">מספר מזהה / ברקוד *</label>
                    <input
                        autoFocus
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="למשל: PC-12345 או ברקוד משרד החינוך"
                        className="w-full px-4 py-3 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-2">רשום את המספר המזהה המודבק על הציוד כדי שהטכנאי יוכל לאתר אותו.</p>
                </div>
            ) : (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* קומה */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">קומה/מבנה</label>
                            <select
                                value={selectedFloor}
                                onChange={handleFloorChange}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">בחירה...</option>
                                {floors.map(f => (
                                    <option key={f.id} value={f.id}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* סוג חדר */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">סוג חדר</label>
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                disabled={!selectedFloor}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">בחירה...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* חדר */}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">חדר/כיתה</label>
                            <select
                                value={selectedRoom}
                                onChange={handleRoomChange}
                                disabled={!selectedCategory}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">בחירה...</option>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.label} (חדר {r.roomNumber})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {displayText && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span>{displayText}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
