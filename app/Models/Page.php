<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['slug', 'title', 'meta_description', 'content', 'is_published'];

    protected function casts(): array
    {
        return [
            'content'      => 'array',
            'is_published' => 'boolean',
        ];
    }
}
