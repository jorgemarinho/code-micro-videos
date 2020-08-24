<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use App\Models\Traits\Uuid;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Ramsey\Uuid\Uuid as RamseyUuid;

class GenreTest extends TestCase
{

    use DatabaseMigrations;

    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function testList()
    {
        factory(Genre::class, 1)->create();
        $genres = Genre::all();
        $this->assertCount( 1, $genres);
        $genreKey = array_keys( $genres->first()->getAttributes() );

        $this->assertEqualsCanonicalizing([
            'id',
            'name',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at'
        ] , $genreKey );
    }

    public function testCreate()
    {
        $genre = Genre::create([
            'name' => 'test1'
        ]);

        $genre->refresh();

        $this->assertEquals('test1', $genre->name );
        $this->assertTrue($genre->is_active);
        $this->assertTrue( RamseyUuid::isValid($genre->id));
    }

    public function testUpdate()
    {
        $genre = factory( Genre::class )->create([
            'name' => 'test2',
            'is_active' => false
        ])->first();

        $data = [
            'name' => 'test3',
            'is_active' => true
        ];

        $genre->update($data);

        foreach($data as $key => $value){
            $this->assertEquals($value,$genre->{$key});
        }
    }

    public function testDestroy()
    {
        $genre = factory( Genre::class )->create([
            'name' => 'test2'
        ])->first();

        $genre->delete();

        $this->assertEquals(0, count(Genre::all()->toArray()));
    }
}
