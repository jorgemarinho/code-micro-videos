<?php

namespace App\Observers;

use App\Models\CastMember;
use Bschmitt\Amqp\Message;

class CastMemberObserver
{

    public function created(CastMember $castMember)
    {
        $message = new Message($castMember->toJson());
        \Amqp::publish( 'model.cast_member.created', $message );
    }

    public function updated(CastMember $castMember)
    {
        $message = new Message($castMember->toJson());
        \Amqp::publish( 'model.cast_member.updated', $message );
    }

    public function deleted(CastMember $castMember)
    {
        $message = new Message(json_encode(['id' => $castMember->id]));
        \Amqp::publish( 'model.cast_member.deleted', $message );
    }

    /**
     * Handle the castMember "restored" event.
     *
     * @param  \App\Models\CastMember  $castMember
     * @return void
     */
    public function restored(CastMember $castMember)
    {
        //
    }

    /**
     * Handle the castMember "force deleted" event.
     *
     * @param  \App\Models\CastMember  $castMember
     * @return void
     */
    public function forceDeleted(CastMember $castMember)
    {
        //
    }
}
