<?php

namespace App\Models\Filters;

use EloquentFilter\ModelFilter;

class CategoryFilter extends DefaultModelFilter
{
    
    protected $sortable = ['name', 'is_active', 'created_at'];

    public function search($search)
    {
        $this->query->where('name', 'LIKE', "%$search%");
    }

    public function isActive($value)
    {
       $this->query->orWhere('is_active', (int)$value);
    }
}
