<?php

namespace App\Models\Filters;

use EloquentFilter\ModelFilter;
use Illuminate\Database\Eloquent\Builder;

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

    public function genres($genres)
    {
        $ids = explode(",", $genres);
        $this->query->whereHas('genres', function (Builder $query) use ($ids) {
            $query
                ->whereIn('id', $ids);
        });
    }
}
