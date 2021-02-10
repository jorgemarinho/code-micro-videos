<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;

class GenreFilter extends DefaultModelFilter
{

    protected $sortable = ['name', 'is_active', 'created_at'];

    public function search($search)
    {
        $this->query->where('name', 'LIKE', "%$search%");
    }

    public function categories($idsOrNames)
    {
        $this->query->whereHas('categories', function (Builder $query) use ($idsOrNames) {
            $query
                ->whereIn('id', $idsOrNames)
                ->orWhereIn('name', $idsOrNames);
        });
    }
}
