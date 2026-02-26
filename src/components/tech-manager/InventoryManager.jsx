import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import { storageService } from '../../services/storage';
import { INVENTORY_CATEGORIES } from '../../lib/constants';

export function InventoryManager({ user }) {
    const [items, setItems] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', category: 'other', inStock: 0, minStock: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsub = storageService.subscribeToInventory(setItems);
        return () => unsub();
    }, []);

    const handleAddItem = async () => {
        if (!newItem.name.trim()) return;
        setLoading(true);
        try {
            await storageService.addInventoryItem({
                name: newItem.name.trim(),
                category: newItem.category,
                inStock: Number(newItem.inStock) || 0,
                minStock: Number(newItem.minStock) || 0,
            });
            setNewItem({ name: '', category: 'other', inStock: 0, minStock: 0 });
            setShowAdd(false);
        } catch (err) {
            console.error('Error adding item:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (itemId, newStock) => {
        try {
            await storageService.updateInventoryItem(itemId, { inStock: Number(newStock) });
        } catch (err) {
            console.error('Error updating stock:', err);
        }
    };

    const lowStockItems = items.filter(i => i.active && i.inStock <= i.minStock);
    const getCategoryLabel = (value) => INVENTORY_CATEGORIES.find(c => c.value === value)?.label || value;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">מלאי ציוד</h1>
                    <p className="text-sm text-muted-foreground mt-1">{items.filter(i => i.active).length} פריטים</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition"
                >
                    <Plus className="w-4 h-4" />
                    הוסף פריט
                </button>
            </div>

            {/* Low stock alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        מלאי נמוך ({lowStockItems.length} פריטים)
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowStockItems.map(item => (
                            <span key={item.id} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-lg">
                                {item.name} ({item.inStock}/{item.minStock})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Add form */}
            {showAdd && (
                <div className="bg-card rounded-2xl border p-4 space-y-3">
                    <h3 className="font-semibold text-sm">פריט חדש</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <input
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="שם הפריט"
                            className="col-span-2 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            className="px-3 py-2 rounded-xl border text-sm"
                        >
                            {INVENTORY_CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={newItem.inStock}
                                onChange={(e) => setNewItem({ ...newItem, inStock: e.target.value })}
                                placeholder="כמות"
                                min="0"
                                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-muted-foreground">סף מינימום:</label>
                        <input
                            type="number"
                            value={newItem.minStock}
                            onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                            min="0"
                            className="w-20 px-2 py-1.5 rounded-lg border text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddItem}
                            disabled={loading || !newItem.name.trim()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? 'שומר...' : 'הוסף'}
                        </button>
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl">
                            ביטול
                        </button>
                    </div>
                </div>
            )}

            {/* Items table */}
            {items.filter(i => i.active).length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">אין פריטים במלאי</p>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">פריט</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">קטגוריה</th>
                                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">במלאי</th>
                                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">מינימום</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.filter(i => i.active).map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{item.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{getCategoryLabel(item.category)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                value={item.inStock}
                                                onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                                                min="0"
                                                className={`w-16 text-center px-2 py-1 rounded-lg border text-sm ${
                                                    item.inStock <= item.minStock ? 'bg-red-50 border-red-200 text-red-700' : ''
                                                }`}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">{item.minStock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
