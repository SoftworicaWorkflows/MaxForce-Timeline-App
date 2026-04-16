<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    /**
     * Get all customers
     */
    public function index(): JsonResponse
    {
        $customers = Customer::orderBy('name')->get();
        return response()->json([
            'customers' => $customers,
            'success' => true
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|unique:customers,email',
            'address' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'service_interval' => 'nullable|string|in:3w,3m,6m,12m',
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'price' => $validated['price'] ?? null,
            'service_interval' => $validated['service_interval'] ?? null,
            'next_service_date' => isset($validated['service_interval']) 
                ? (str_ends_with($validated['service_interval'], 'w') 
                    ? now()->addWeeks((int)$validated['service_interval'])->toDateString() 
                    : now()->addMonths((int)$validated['service_interval'])->toDateString())
                : null,
        ]);

        // Trigger real-time notification
        Notification::create([
            'type' => 'success',
            'title' => 'New Customer Registered',
            'message' => "Customer {$customer->name} has been successfully added to the system.",
            'is_read' => false
        ]);

        return response()->json([
            'customer' => $customer,
            'success' => true,
            'message' => 'Customer registered successfully'
        ], 201);
    }

    /**
     * Update an existing customer
     */
    public function update(Request $request, $id): JsonResponse
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'sometimes|nullable|email|unique:customers,email,' . $id,
            'address' => 'sometimes|nullable|string|max:255',
            'price' => 'sometimes|nullable|numeric|min:0',
            'service_interval' => 'sometimes|nullable|string|in:3w,3m,6m,12m',
        ]);

        if (isset($validated['service_interval']) && $validated['service_interval'] != $customer->service_interval) {
            $validated['next_service_date'] = str_ends_with($validated['service_interval'], 'w') 
                ? now()->addWeeks((int)$validated['service_interval'])->toDateString() 
                : now()->addMonths((int)$validated['service_interval'])->toDateString();
        }

        $customer->update($validated);

        return response()->json([
            'customer' => $customer,
            'success' => true,
            'message' => 'Customer updated successfully'
        ]);
    }

    /**
     * Get customer statistics and service history
     */
    public function getStats($id): JsonResponse
    {
        $customer = Customer::with(['bookings' => function($query) {
            $query->orderBy('booking_date', 'desc')->orderBy('start_time', 'desc');
        }])->find($id);

        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Customer not found'], 404);
        }

        return response()->json([
            'success' => true,
            'customer' => $customer,
            'stats' => [
                'total_services' => $customer->bookings->count(),
                'latest_service' => $customer->bookings->first(),
                'history' => $customer->bookings
            ]
        ]);
    }

    /**
     * Delete a customer
     */
    public function destroy($id): JsonResponse
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully'
        ]);
    }
}
