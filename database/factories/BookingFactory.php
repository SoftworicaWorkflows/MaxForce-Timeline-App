<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $times = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00', '17:30'
        ];

        return [
            'booking_date' => $this->faker->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'booking_time' => $this->faker->randomElement($times),
            'customer_name' => $this->faker->name(),
            'phone_number' => $this->faker->phoneNumber(),
            'email' => $this->faker->email(),
            'service_notes' => $this->faker->optional()->sentence(),
            'status' => 'available',
        ];
    }
}
