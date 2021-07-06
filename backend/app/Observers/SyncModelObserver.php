<?php

namespace App\Observers;

use Bschmitt\Amqp\Message;
use Illuminate\Database\Eloquent\Model;
use ReflectionClass;

class SyncModelObserver
{
    public function created(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";

        $this->publish($routingKey, $data);
    }

    public function updated(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";

        $this->publish($routingKey, $data);
    }

    public function deleted(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = ['id' => $model->id];
        $action = __FUNCTION__;
        $message = new Message($model->toJson());
        $routingKey = "model.{$modelName}.{$action}";

        $this->publish($routingKey, $data);
    }

    public function restored(model $model)
    {
        //
    }

    public function forceDeleted(model $model)
    {
        //
    }

    protected function getModelName(Model $model)
    {
        $shortName = (new ReflectionClass($model))->getShortName();
        return Str::snake($shortName);
    }

    protected function publish($routingKey, array $data)
    {
        $message = new Message(
            json_encode($data),
            [
                'content_type' => 'application/json',
                'delivery_mode' => 2
            ]
        );

        \Amqp::publish(
            $routingKey,
            $message,
            [
                'exchange_type' => 'topic',
                'exchange' => 'amq.topic'
            ]
        );
    }
}
