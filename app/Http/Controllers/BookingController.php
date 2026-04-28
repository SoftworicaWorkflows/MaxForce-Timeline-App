<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Get statistics for the dashboard.
     */
    public function getDashboardStats(): JsonResponse
    {
        $totalCustomers = Customer::count();
        $totalBookings = Booking::count();
        $bookingsThisMonth = Booking::whereMonth('booking_date', Carbon::now()->month)
            ->whereYear('booking_date', Carbon::now()->year)
            ->count();
        $upcomingBookings = Booking::where('booking_date', '>=', Carbon::now()->toDateString())
            ->where('status', 'booked')
            ->count();
        $unreadNotifications = Notification::where('is_read', false)->count();

        // Trend data for charts (last 6 months)
        $bookingTrends = [];
        $customerTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M');
            
            $bookingCount = Booking::whereMonth('booking_date', $month->month)
                ->whereYear('booking_date', $month->year)
                ->count();
                
            $customerCount = Customer::whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->count();
                
            $bookingTrends[] = ['month' => $monthName, 'count' => $bookingCount];
            $customerTrends[] = ['month' => $monthName, 'count' => $customerCount];
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'totalCustomers' => $totalCustomers,
                'totalBookings' => $totalBookings,
                'bookingsThisMonth' => $bookingsThisMonth,
                'upcomingBookings' => $upcomingBookings,
                'unreadNotifications' => $unreadNotifications,
                'bookingTrends' => $bookingTrends,
                'customerTrends' => $customerTrends,
            ]
        ]);
    }
    /**
     * Get schedule for a specific date
     */
    public function getSchedule(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->format('Y-m-d'));
        
        $bookings = Booking::whereDate('booking_date', $date)->orderBy('start_time')->get();

        return response()->json([
            'date' => $date,
            'slots' => $bookings,
            'success' => true
        ]);
    }

    /**
     * Get all bookings (for admin)
     */
    public function getBookings(Request $request): JsonResponse
    {
        $query = Booking::with('customer');

        if ($request->filled('date')) {
            $query->whereDate('booking_date', $request->query('date'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $bookings = $query->orderBy('booking_date')->orderBy('start_time')->get();

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
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'customer_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string|max:255',
            'service_notes' => 'nullable|string|max:1000',
            'price' => 'nullable|numeric|min:0',
            'service_interval' => 'nullable|string|in:2m,3w,3m,6m,12m',
        ]);

        if ($this->hasOverlap($validated['booking_date'], $validated['start_time'], $validated['end_time'])) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot overlaps with an existing booking.',
            ], 409);
        }

        $customerId = $validated['customer_id'];

        if (!$customerId) {
            // Find or create customer by phone number
            $customer = Customer::where('phone', $validated['phone_number'])->first();
            
            if (!$customer) {
                $customer = Customer::create([
                    'name' => $validated['customer_name'],
                    'phone' => $validated['phone_number'],
                    'email' => $validated['email'],
                    'address' => $validated['address'],
                    'price' => $validated['price'] ?? null,
                ]);
            } else {
                $customer->update(['price' => $validated['price'] ?? $customer->price]);
            }
            $customerId = $customer->id;
        } else {
            // Update existing customer's price and interval if provided
            $updateData = ['price' => $validated['price']];
            if (isset($validated['service_interval'])) {
                $updateData['service_interval'] = $validated['service_interval'];
                $interval = $validated['service_interval'];
                $dateObj = \Carbon\Carbon::parse($validated['booking_date']);
                
                if (str_ends_with($interval, 'w')) {
                    $dateObj->addWeeks((int)$interval);
                } elseif (str_ends_with($interval, 'm')) {
                    $dateObj->addMonths((int)$interval);
                }
                
                $updateData['next_service_date'] = $dateObj->toDateString();
            }
            Customer::where('id', $customerId)->update($updateData);
        }

        // Additional Logic for New Customer: Calculate next service date
        if (isset($validated['service_interval'])) {
            $customer = Customer::find($customerId);
            $interval = $validated['service_interval'];
            $dateObj = \Carbon\Carbon::parse($validated['booking_date']);
            
            if (str_ends_with($interval, 'w')) {
                $dateObj->addWeeks((int)$interval);
            } elseif (str_ends_with($interval, 'm')) {
                $dateObj->addMonths((int)$interval);
            }
            
            $customer->update([
                'service_interval' => $interval,
                'next_service_date' => $dateObj->toDateString(),
            ]);
        }

        $booking = Booking::create([
            ...$validated,
            'customer_id' => $customerId,
            'status' => 'booked',
        ]);

        // Trigger real-time notification
        Notification::create([
            'type' => 'info',
            'title' => 'New Booking Received',
            'message' => "A new booking for {$booking->customer_name} on {$booking->booking_date} at {$booking->start_time} has been confirmed.",
            'is_read' => false
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
        // Suggesting time slots isn't very useful without fixed slots,
        // so we just return an empty suggestions array for now.
        return response()->json([
            'suggestions' => [],
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
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        if ($this->hasOverlap($validated['booking_date'], $validated['start_time'], $validated['end_time'])) {
            return response()->json([
                'success' => false,
                'message' => 'This blocked time overlaps with an existing booking.',
            ], 409);
        }

        $booking = Booking::create(
            [...$validated, 'status' => 'blocked', 'customer_name' => 'BLOCKED', 'phone_number' => 'N/A', 'email' => 'admin@localhost']
        );

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
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
            'customer_name' => 'sometimes|required|string|max:255',
            'phone_number' => 'sometimes|required|string|max:20',
            'email' => 'sometimes|nullable|email',
            'address' => 'sometimes|nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:available,booked,confirmed,completed,cancelled,blocked',
            'service_interval' => 'nullable|string|in:2m,3w,3m,6m,12m',
        ]);
        
        $newDate = $validated['booking_date'] ?? $booking->booking_date;
        $newStart = $validated['start_time'] ?? $booking->start_time;
        $newEnd = $validated['end_time'] ?? $booking->end_time;

        if ($this->hasOverlap($newDate, $newStart, $newEnd, $id)) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot overlaps with an existing booking.',
            ], 409);
        }

        $booking->update($validated);

        // Update customer's next service date if booking date or interval changed
        if ($booking->customer_id && (isset($validated['booking_date']) || array_key_exists('service_interval', $validated))) {
            $customer = Customer::find($booking->customer_id);
            if ($customer) {
                $interval = array_key_exists('service_interval', $validated) ? $validated['service_interval'] : $customer->service_interval;
                
                if ($interval) {
                    $dateObj = \Carbon\Carbon::parse($newDate);
                    if (str_ends_with($interval, 'w')) {
                        $dateObj->addWeeks((int)$interval);
                    } elseif (str_ends_with($interval, 'm')) {
                        $dateObj->addMonths((int)$interval);
                    }
                    
                    $customer->update([
                        'service_interval' => $interval,
                        'next_service_date' => $dateObj->toDateString(),
                    ]);
                } elseif (array_key_exists('service_interval', $validated) && is_null($validated['service_interval'])) {
                    // User explicitly set "No Reminder"
                    $customer->update([
                        'service_interval' => null,
                        'next_service_date' => null,
                    ]);
                }
            }
        }

        // Trigger real-time notification
        Notification::create([
            'type' => 'warning',
            'title' => 'Booking Updated',
            'message' => "Booking ID #{$booking->id} for {$booking->customer_name} has been modified.",
            'is_read' => false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    /**
     * Check if a time slot is available
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $date = $request->query('date');
        $start = $request->query('start_time');
        $end = $request->query('end_time');
        $excludeId = $request->query('exclude_id');

        if (!$date || !$start || !$end) {
            return response()->json([
                'available' => false,
                'message' => 'Missing required parameters'
            ], 400);
        }

        $isBooked = $this->hasOverlap($date, $start, $end, $excludeId);

        return response()->json([
            'available' => !$isBooked,
            'success' => true
        ]);
    }
    
    private function hasOverlap($date, $start, $end, $excludeId = null)
    {
        $startStr = \Carbon\Carbon::parse($start)->format('H:i');
        $endStr = \Carbon\Carbon::parse($end)->format('H:i');
        $dateStr = \Carbon\Carbon::parse($date)->format('Y-m-d');

        $query = Booking::where(\DB::raw("date(booking_date)"), $dateStr)
            ->where('status', '!=', 'available')
            ->where(function($q) use ($startStr, $endStr) {
                // overlap: new start < existing end AND new end > existing start
                // substr prevents issues with how time() columns append :00 seconds
                $q->where(\DB::raw("substr(start_time, 1, 5)"), '<', $endStr)
                  ->where(\DB::raw("substr(end_time, 1, 5)"), '>', $startStr);
            });
            
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            return true;
        }

        // Check if any customer has a next_service_date on this day
        // This acts as a hard block for the entire day as per client requirement
        return \App\Models\Customer::whereDate('next_service_date', $dateStr)->exists();
    }

    /**
     * Format time to 12-hour format
     */
    private function formatTime($time): string
    {
        return Carbon::createFromFormat('H:i', $time)->format('h:i A');
    }
}

