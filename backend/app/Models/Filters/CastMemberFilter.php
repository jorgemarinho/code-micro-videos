<?php

namespace App\Models\Filters;

use App\Models\CastMember;

class CastMemberFilter extends DefaultModelFilter
{

    protected $sortable = ['name', 'type', 'created_at'];

    public function search($search)
    {
        $this->query->where('name', 'LIKE', "%$search%");
    }

    public function type($type)
    {
        if (in_array((int)$type, CastMember::$types)) {
            $this->query->orWhere('type', (int)$type);
        }
    }
}
