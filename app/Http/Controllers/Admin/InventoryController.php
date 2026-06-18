<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeviceCategory;
use App\Models\Part;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Part::with('deviceCategory');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($cat = $request->get('category_id')) {
            $query->where('device_category_id', $cat);
        }

        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock_quantity', '<=', 'min_stock_alert');
        }

        $parts      = $query->latest()->paginate(20)->withQueryString();
        $categories = DeviceCategory::all(['id', 'name']);

        $lowStockCount = Part::whereColumn('stock_quantity', '<=', 'min_stock_alert')
            ->where('is_active', true)->count();

        return Inertia::render('Admin/Inventory/Index', [
            'parts'         => $parts,
            'categories'    => $categories,
            'filters'       => $request->only(['search', 'category_id', 'low_stock']),
            'lowStockCount' => $lowStockCount,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'sku'                => ['nullable', 'string', 'unique:parts,sku'],
            'device_category_id' => ['nullable', 'exists:device_categories,id'],
            'description'        => ['nullable', 'string'],
            'cost_price'         => ['required', 'numeric', 'min:0'],
            'sell_price'         => ['required', 'numeric', 'min:0'],
            'stock_quantity'     => ['required', 'integer', 'min:0'],
            'min_stock_alert'    => ['required', 'integer', 'min:0'],
            'supplier'           => ['nullable', 'string'],
        ]);

        Part::create($data);
        return redirect()->route('admin.inventory.index')->with('success', 'Запчастина додана.');
    }

    public function update(Request $request, Part $part): RedirectResponse
    {
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'sku'                => ['nullable', 'string', "unique:parts,sku,{$part->id}"],
            'device_category_id' => ['nullable', 'exists:device_categories,id'],
            'description'        => ['nullable', 'string'],
            'cost_price'         => ['required', 'numeric', 'min:0'],
            'sell_price'         => ['required', 'numeric', 'min:0'],
            'stock_quantity'     => ['required', 'integer', 'min:0'],
            'min_stock_alert'    => ['required', 'integer', 'min:0'],
            'supplier'           => ['nullable', 'string'],
            'is_active'          => ['boolean'],
        ]);

        $part->update($data);
        return back()->with('success', 'Запчастина оновлена.');
    }

    public function destroy(Part $part): RedirectResponse
    {
        $part->delete();
        return redirect()->route('admin.inventory.index')->with('success', 'Запчастина видалена.');
    }

    public function adjustStock(Request $request, Part $part): RedirectResponse
    {
        $data = $request->validate([
            'adjustment' => ['required', 'integer'],
            'reason'     => ['nullable', 'string'],
        ]);

        $newQty = max(0, $part->stock_quantity + $data['adjustment']);
        $part->update(['stock_quantity' => $newQty]);

        return back()->with('success', 'Залишок на складі змінено.');
    }
}
