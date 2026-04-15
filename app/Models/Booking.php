<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'booking_date',
        'start_time',
        'end_time',
        'customer_name',
        'phone_number',
        'email',
        'address',
        'service_notes',
        'price',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    protected $casts = [
        'booking_date' => 'date',
    ];

    /**
     * Scope to get available slots for a specific date
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('booking_date', $date);
    }

    /**
     * Scope to get booked slots
     */
    public function scopeBooked($query)
    {
        return $query->where('status', 'booked');
    }

    /**
     * Scope to get available slots
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope to get blocked slots
     */
    public function scopeBlocked($query)
    {
        return $query->where('status', 'blocked');
    }
}
