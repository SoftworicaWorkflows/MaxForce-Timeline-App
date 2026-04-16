<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Notification;

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
        $overdueCustomers = \App\Models\Customer::whereNotNull('next_service_date')
            ->where('next_service_date', '<=', now()->toDateString())
            ->get();

        foreach ($overdueCustomers as $customer) {
            // Check if a reminder was already created in the last 7 days for this customer
            $alreadyNotified = Notification::where('category', 'service')
                ->where('title', 'LIKE', "%{$customer->name}%")
                ->where('created_at', '>', now()->subDays(7))
                ->exists();

            if (!$alreadyNotified) {
                Notification::create([
                    'type' => 'warning',
                    'category' => 'service',
                    'title' => 'Service Reminder',
                    'message' => "Customer {$customer->name} is due for their next service. Scheduled date was " . \Carbon\Carbon::parse($customer->next_service_date)->format('d M, Y') . ".",
                    'is_read' => false
                ]);
            }
        }
    }
}
