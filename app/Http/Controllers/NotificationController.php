<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get recent notifications.
     */
    public function index(Request $request)
    {
        // Auto-generate service reminders if needed
        $this->generateServiceReminders();

        $query = Notification::orderBy('created_at', 'desc');
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('all')) {
            $notifications = $query->paginate(15);
        } else {
            $notifications = $query->take(20)->get();
        }
            
        $unreadCount = Notification::where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Create a test notification instantly.
     */
    public function triggerTest(Request $request)
    {
        $type = $request->input('type', 'info');
        $delay = $request->input('delay', 0); // minutes
        
        $title = $delay > 0 ? "Test {$delay}m Reminder" : "Immediate Test Notification";
        $message = $delay > 0 
            ? "This is a test reminder scheduled {$delay} minutes before an imaginary event."
            : "This is an immediate test notification to verify the system works!";

        $notification = Notification::create([
            'type' => $type,
            'category' => 'service',
            'title' => $title,
            'message' => $message,
            'is_read' => false
        ]);

        return response()->json([
            'success' => true,
            'notification' => $notification
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($id)
    {
        $notification = Notification::find($id);
        
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        Notification::where('is_read', false)->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Scan customers for upcoming services and generate notifications.
     */
    private function generateServiceReminders()
    {
        // 1a. Check for services due in exactly 1 week (or within the next 7 days)
        $upcomingWeekCustomers = \App\Models\Customer::whereNotNull('next_service_date')
            ->whereBetween('next_service_date', [now()->addDay()->toDateString(), now()->addDays(7)->toDateString()])
            ->get();
            
        foreach ($upcomingWeekCustomers as $customer) {
            $alreadyNotified = Notification::where('category', 'service')
                ->where('title', 'Upcoming Service Reminder (1 Week)')
                ->where('message', 'LIKE', "%{$customer->name}%")
                ->where('created_at', '>', now()->subDays(8))
                ->exists();
                
            if (!$alreadyNotified) {
                Notification::create([
                    'type' => 'info',
                    'category' => 'service',
                    'title' => 'Upcoming Service Reminder (1 Week)',
                    'message' => "Customer {$customer->name} is due for their next service on " . \Carbon\Carbon::parse($customer->next_service_date)->format('d M, Y') . ".",
                    'is_read' => false
                ]);
            }
        }

        // 1b. Check for overdue/same day services
        $overdueCustomers = \App\Models\Customer::whereNotNull('next_service_date')
            ->where('next_service_date', '<=', now()->toDateString())
            ->get();
    
        foreach ($overdueCustomers as $customer) {
            $alreadyNotified = Notification::where('category', 'service')
                ->where('title', 'Service Reminder (Today)')
                ->where('message', 'LIKE', "%{$customer->name}%")
                ->where('created_at', '>', now()->subDays(7))
                ->exists();
    
            if (!$alreadyNotified) {
                Notification::create([
                    'type' => 'warning',
                    'category' => 'service',
                    'title' => 'Service Reminder (Today)',
                    'message' => "Customer {$customer->name} is due for their service today! Scheduled date was " . \Carbon\Carbon::parse($customer->next_service_date)->format('d M, Y') . ".",
                    'is_read' => false
                ]);
            }
        }
    
        // 2. Check for upcoming bookings in the next 15 minutes
        $now = now();
        $soon = now()->addMinutes(15);
        
        $upcomingBookings = \App\Models\Booking::whereDate('booking_date', $now->toDateString())
            ->where('start_time', '>=', $now->format('H:i'))
            ->where('start_time', '<=', $soon->format('H:i'))
            ->where('status', 'booked')
            ->get();
            
        foreach ($upcomingBookings as $booking) {
            $alreadyNotified = Notification::where('category', 'service')
                ->where('title', 'Upcoming Booking')
                ->where('message', 'LIKE', "%{$booking->customer_name}%")
                ->where('created_at', '>', now()->subHours(2))
                ->exists();
                
            if (!$alreadyNotified) {
                Notification::create([
                    'type' => 'info',
                    'category' => 'service',
                    'title' => 'Upcoming Booking',
                    'message' => "Appointment with {$booking->customer_name} is starting at " . \Carbon\Carbon::parse($booking->start_time)->format('h:i A') . ".",
                    'is_read' => false
                ]);
            }
        }
    }
}
