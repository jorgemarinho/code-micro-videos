<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class CastMemberUnitTest extends TestCase
{
    protected $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = new CastMember();
    }

    /**
     * A basic unit test example.
     *
     * @return void
     */
    public function testFillableAtribute()
    {
        $fillable = ['name', 'type'];
        $this->assertEquals($fillable, $this->castMember->getFillable());
    }

    public function testDatesAtribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        foreach($dates as $date) {
            $this->assertContains($date, $this->castMember->getDates());
        }

        $this->assertCount(count($dates),$this->castMember->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class
        ];

        $castMemberTraits = array_keys(class_uses(CastMember::class));

        $this->assertEquals($traits,$castMemberTraits);
    }

    public function testCasts()
    {
        $casts = [ 'id' => 'string' , 'name' => 'string', 'type' => 'integer'];
        $this->assertEquals($casts,$this->castMember->getCasts());
    }

    public function testIncrementing()
    {
        $this->assertFalse($this->castMember->incrementing);
    }
}
