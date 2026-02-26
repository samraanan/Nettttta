import { useState, useEffect } from 'react';
import { X, Package, Plus, Minus } from 'lucide-react';
import { storageService } from '../../services/storage';

export function EquipmentSupplyModal({ call, user, onClose }) {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const unsub = storageService.subscribeToInventory(setItems);
        return () => unsub();
    }, []);

    const availableItems = items.filter(i => i.active && i.inStock > 0);
    const selected = availableItems.find(i => i.id === selectedItem);

    const handleSupply = async () => {
        if (!selectedItem || !selected || quantity < 1) return;
        if (quantity > selected.inStock) return;

        setLoading(true);
        try {
            // addSuppliedEquipment already deducts inventory inside a transaction
            await storageService.addSuppliedEquipment(
                call.id, selectedItem, selected.name, quantity,
                user.uid, user.displayName
            );
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSelectedItem('');
                setQuantity(1);
            }, 1500);
        } catch (err) {
            console.error('Error supplying equipment:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        סיפוק ציוד מהמלאי
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Package className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="font-medium">הציוד סופק בהצלחה!</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">בחר פריט</label>
                                <select
                                    value={selectedItem}
                                    onChange={(e) => {
                                        setSelectedItem(e.target.value);
                                        setQuantity(1);
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">בחר ציוד...</option>
                                    {availableItems.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (במלאי: {item.inStock})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selected && (
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">כמות</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-muted transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, Math.min(selected.inStock, Number(e.target.value) || 1)))}
                                            min={1}
                                            max={selected.inStock}
                                            className="w-20 text-center px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(selected.inStock, quantity + 1))}
                                            className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-muted transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs text-muted-foreground">מתוך {selected.inStock}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSupply}
                                disabled={loading || !selectedItem || quantity < 1}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Package className="w-4 h-4" />
                                )}
                                ספק ציוד
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
