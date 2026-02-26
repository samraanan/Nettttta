import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export function LocationPicker({ locations, value, onChange }) {
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
        if (room && floor && category) {
            onChange({
                floorId: floor.id,
                floorLabel: floor.label,
                categoryId: category.id,
                categoryLabel: category.label,
                roomId: room.id,
                roomNumber: room.roomNumber,
                roomLabel: room.label
            });
        }
    }, [selectedRoom, onChange, room, floor, category]);

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
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* קומה */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">קומה</label>
                    <select
                        value={selectedFloor}
                        onChange={handleFloorChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">בחר קומה</option>
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
                        <option value="">בחר סוג</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* חדר */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">חדר</label>
                    <select
                        value={selectedRoom}
                        onChange={handleRoomChange}
                        disabled={!selectedCategory}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">בחר חדר</option>
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
    );
}
