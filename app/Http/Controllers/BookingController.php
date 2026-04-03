<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Get schedule for a specific date
     */
    public function getSchedule(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->format('Y-m-d'));
        
        // Define available time slots
        $timeSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00', '17:30'
        ];

        $bookings = Booking::forDate($date)->get();
        
        $bookedTimes = $bookings
            ->where('status', '!=', 'available')
            ->pluck('booking_time')
            ->toArray();

        $schedule = array_map(function ($time) use ($bookedTimes) {
            return [
                'time' => $time,
                'status' => in_array($time, $bookedTimes) ? 'booked' : 'available',
                'label' => $this->formatTime($time)
            ];
        }, $timeSlots);

        return response()->json([
            'date' => $date,
            'slots' => $schedule,
            'success' => true
        ]);
    }

    /**
     * Get all bookings (for admin)
     */
    public function getBookings(Request $request): JsonResponse
    {
        $query = Booking::query();

        if ($request->filled('date')) {
            $query->where('booking_date', $request->query('date'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $bookings = $query->orderBy('booking_date')->orderBy('booking_time')->get();

        return response()->json([
            'bookings' => $bookings,
            'success' => true
        ]);
    }

    /**
     * Create a new booking
     */
    public function createBooking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'customer_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'email' => 'required|email',
            'address' => 'nullable|string|max:255',
            'service_notes' => 'nullable|string|max:1000',
        ]);

        // Check if slot is already booked
        $existingBooking = Booking::where('booking_date', $validated['booking_date'])
            ->where('booking_time', $validated['booking_time'])
            ->where('status', '!=', 'available')
            ->first();

        if ($existingBooking) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already booked',
            ], 409);
        }

        $booking = Booking::create([
            ...$validated,
            'status' => 'booked',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'booking' => $booking
        ], 201);
    }

    /**
     * Get suggested time slots
     */
    public function getSuggestions(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->format('Y-m-d'));
        $time = $request->query('time');

        $timeSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00', '17:30'
        ];

        $bookedTimes = Booking::forDate($date)
            ->where('status', '!=', 'available')
            ->pluck('booking_time')
            ->toArray();

        $availableSlots = array_diff($timeSlots, $bookedTimes);
        
        // Sort and get closest 5 slots
        $availableSlots = array_values($availableSlots);
        $timeIndex = array_search($time, $timeSlots);
        
        if ($timeIndex !== false) {
            usort($availableSlots, function ($a, $b) use ($timeIndex, $timeSlots) {
                $aIndex = array_search($a, $timeSlots);
                $bIndex = array_search($b, $timeSlots);
                return abs($aIndex - $timeIndex) - abs($bIndex - $timeIndex);
            });
        }

        $suggestions = array_slice($availableSlots, 0, 5);

        return response()->json([
            'suggestions' => array_map(fn($t) => [
                'time' => $t,
                'label' => $this->formatTime($t)
            ], $suggestions),
            'success' => true
        ]);
    }

    /**
     * Delete a booking (admin)
     */
    public function deleteBooking($id): JsonResponse
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Booking deleted successfully'
        ]);
    }

    /**
     * Block or unblock a time slot (admin)
     */
    public function blockTimeSlot(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_date' => 'required|date',
            'booking_time' => 'required|date_format:H:i',
        ]);

        $booking = Booking::firstOrCreate(
            $validated,
            [...$validated, 'status' => 'blocked', 'customer_name' => 'BLOCKED']
        );

        $booking->update(['status' => 'blocked']);

        return response()->json([
            'success' => true,
            'message' => 'Time slot blocked',
            'booking' => $booking
        ]);
    }

    /**
     * Update an existing booking (admin)
     */
    public function updateBooking(Request $request, $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        $validated = $request->validate([
            'booking_date' => 'sometimes|required|date',
            'booking_time' => 'sometimes|required|date_format:H:i',
            'customer_name' => 'sometimes|required|string|max:255',
            'phone_number' => 'sometimes|required|string|max:20',
            'email' => 'sometimes|required|email',
            'address' => 'sometimes|nullable|string|max:255',
            'service_notes' => 'nullable|string|max:1000',
            'status' => 'sometimes|required|in:available,booked,blocked'
        ]);

        // If trying to change date/time, check for conflicts
        if (($request->filled('booking_date') && $request->booking_date !== Carbon::parse($booking->booking_date)->format('Y-m-d')) ||
            ($request->filled('booking_time') && $request->booking_time !== Carbon::parse($booking->booking_time)->format('H:i'))) {
            
            $newDate = $request->booking_date ?? Carbon::parse($booking->booking_date)->format('Y-m-d');
            $newTime = $request->booking_time ?? Carbon::parse($booking->booking_time)->format('H:i');

            $existingBooking = Booking::where('booking_date', $newDate)
                ->where('booking_time', $newTime)
                ->where('id', '!=', $id)
                ->where('status', '!=', 'available')
                ->first();

            if ($existingBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'This time slot is already booked by another customer.',
                ], 409);
            }
        }

        $booking->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    /**
     * Format time to 12-hour format
     */
    private function formatTime($time): string
    {
        return Carbon::createFromFormat('H:i', $time)->format('h:i A');
    }
}

