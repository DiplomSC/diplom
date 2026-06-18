<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeviceCategory;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $uncategorized = DeviceCategory::firstOrCreate(
            ['slug' => 'uncategorized'],
            ['name' => 'Uncategorized', 'sort_order' => 9999, 'is_active' => true]
        );

        $query = Service::with('category')->orderBy('sort_order');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('device_category_id', $categoryId);
        }

        $services   = $query->paginate(20)->withQueryString();
        $categories = DeviceCategory::orderBy('sort_order')->get(['id', 'name', 'slug', 'icon', 'description', 'sort_order', 'is_active']);

        return Inertia::render('Admin/Services/Index', [
            'services'        => $services,
            'categories'      => $categories,
            'uncategorizedId' => $uncategorized->id,
            'filters'         => $request->only(['search', 'category_id']),
        ]);
    }

    // категорії CRUD
    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'icon'        => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'sort_order'  => ['integer'],
        ]);

        $data['slug'] = Str::slug($data['name']);
        DeviceCategory::create($data);

        return back()->with('success', 'Категорія створена.');
    }

    public function updateCategory(Request $request, DeviceCategory $category): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'icon'        => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'sort_order'  => ['integer'],
            'is_active'   => ['boolean'],
        ]);

        $category->update($data);
        return back()->with('success', 'Категорія оновлена.');
    }

    public function destroyCategory(DeviceCategory $category): RedirectResponse
    {
        if ($category->slug === 'uncategorized') {
            return back()->with('error', 'Категорія Uncategorized не може бути видалена.');
        }

        $uncategorized = DeviceCategory::firstOrCreate(
            ['slug' => 'uncategorized'],
            ['name' => 'Uncategorized', 'sort_order' => 9999, 'is_active' => true]
        );

        // прив'язати всі послуги видаленої категорії до Uncategorized
        Service::where('device_category_id', $category->id)
            ->update(['device_category_id' => $uncategorized->id]);

        $category->delete();
        return back()->with('success', 'Категорія видалена. Послуги з цієї категорії переміщені в Uncategorized.');
    }

    // послуги CRUD
    public function storeService(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'device_category_id' => ['nullable', 'exists:device_categories,id'],
            'name'               => ['required', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'price_from'         => ['required', 'numeric', 'min:0'],
            'price_to'           => ['nullable', 'numeric', 'min:0'],
            'duration_minutes'   => ['nullable', 'integer'],
            'bonus_earn'         => ['integer', 'min:0'],
            'icon'               => ['nullable', 'string'],
            'is_popular'         => ['boolean'],
            'is_active'          => ['boolean'],
            'sort_order'         => ['integer'],
        ]);

        if (empty($data['device_category_id'])) {
            $data['device_category_id'] = DeviceCategory::where('slug', 'uncategorized')->value('id');
        }
        $data['slug'] = Str::slug($data['name'] . '-' . time());
        Service::create($data);

        return back()->with('success', 'Послуга створена.');
    }

    public function updateService(Request $request, Service $service): RedirectResponse
    {
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'device_category_id' => ['nullable', 'exists:device_categories,id'],
            'description'        => ['nullable', 'string'],
            'price_from'         => ['required', 'numeric', 'min:0'],
            'price_to'           => ['nullable', 'numeric', 'min:0'],
            'duration_minutes'   => ['nullable', 'integer'],
            'bonus_earn'         => ['integer', 'min:0'],
            'icon'               => ['nullable', 'string'],
            'is_popular'         => ['boolean'],
            'is_active'          => ['boolean'],
        ]);

        if (empty($data['device_category_id'])) {
            $data['device_category_id'] = DeviceCategory::where('slug', 'uncategorized')->value('id');
        }

        $service->update($data);
        return back()->with('success', 'Послуга оновлена.');
    }

    public function destroyService(Service $service): RedirectResponse
    {
        $service->delete();
        return back()->with('success', 'Послуга видалена.');
    }

    public function reorderCategories(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate(['ids' => ['required', 'array']]);
        foreach ($request->input('ids') as $index => $id) {
            DeviceCategory::where('id', $id)->update(['sort_order' => $index]);
        }
        return response()->json(['ok' => true]);
    }

    public function reorderServices(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate(['ids' => ['required', 'array']]);
        foreach ($request->input('ids') as $index => $id) {
            Service::where('id', $id)->update(['sort_order' => $index]);
        }
        return response()->json(['ok' => true]);
    }
}
