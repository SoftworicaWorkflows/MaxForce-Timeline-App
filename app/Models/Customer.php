<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'price',
        'service_interval',
        'next_service_date',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
