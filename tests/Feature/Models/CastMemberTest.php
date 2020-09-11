<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Ramsey\Uuid\Uuid as RamseyUuid;

class CastMemberTest extends TestCase
{

    use DatabaseMigrations;

    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $castMember = CastMember::all();
        $this->assertCount(1, $castMember);
        $castMemberKey = array_keys($castMember->first()->getAttributes());

        $this->assertEqualsCanonicalizing([
            'id',
            'name',
            'type',
            'created_at',
            'updated_at',
            'deleted_at'
        ], $castMemberKey);
    }

    public function testCreate()
    {
        $castMember = CastMember::create([
            'name' => 'test1',
            'type' =>  array_rand(array_flip([CastMember::TYPE_ACTOR, CastMember::TYPE_DIRECTOR]), 1)
        ]);

        $castMember->refresh();
        $this->assertEquals('test1', $castMember->name);
        $this->assertTrue(RamseyUuid::isValid($castMember->id));
    }

    public function testUpdate()
    {
        $castMember = factory(CastMember::class)->create([
            'name' => 'test2'
        ])->first();

        $data = [
            'name' => 'test3'
        ];

        $castMember->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $castMember->{$key});
        }
    }

    public function testDestroy()
    {
        $castMember = factory(CastMember::class)->create([
            'name' => 'test2'
        ])->first();

        $castMember->delete();

        $this->assertEquals(0, count(CastMember::all()->toArray()));
    }
}
