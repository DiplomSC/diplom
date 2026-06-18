<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeviceCategory extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'description', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function parts(): HasMany
    {
        return $this->hasMany(Part::class);
    }
}
