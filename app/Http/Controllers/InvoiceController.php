<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Get all invoices
     */
    public function index(): JsonResponse
    {
        $invoices = Invoice::with('customer')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'invoices' => $invoices,
            'success' => true
        ]);
    }

    /**
     * Store a newly created invoice
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_no' => 'required|unique:invoices,invoice_no',
            'issue_date' => 'required|date',
            'due_date' => 'nullable|date',
            'payment_method' => 'nullable|string',
            'subtotal' => 'required|numeric',
            'total' => 'required|numeric',
            'gst_status' => 'required|boolean',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.qty' => 'required|integer',
            'items.*.unit_price' => 'required|numeric',
            'items.*.amount' => 'required|numeric',
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated) {
                $invoice = Invoice::create([
                    'invoice_no' => $validated['invoice_no'],
                    'customer_id' => $validated['customer_id'],
                    'issue_date' => $validated['issue_date'],
                    'due_date' => $validated['due_date'],
                    'payment_method' => $validated['payment_method'],
                    'subtotal' => $validated['subtotal'],
                    'total' => $validated['total'],
                    'gst_status' => $validated['gst_status'],
                    'notes' => $validated['notes'],
                ]);

                foreach ($validated['items'] as $item) {
                    $invoice->items()->create($item);
                }

                return $invoice->load('customer', 'items');
            });

            // Trigger notification
            Notification::create([
                'type' => 'success',
                'title' => 'Invoice Generated',
                'message' => "Invoice #{$invoice->invoice_no} has been successfully generated for {$invoice->customer->name}.",
                'is_read' => false
            ]);

            return response()->json([
                'invoice' => $invoice,
                'success' => true,
                'message' => 'Invoice generated successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified invoice
     */
    public function show($id): JsonResponse
    {
        $invoice = Invoice::with(['customer', 'items'])->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found'
            ], 404);
        }

        return response()->json([
            'invoice' => $invoice,
            'success' => true
        ]);
    }

    /**
     * Remove the specified invoice
     */
    public function destroy($id): JsonResponse
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found'
            ], 404);
        }

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invoice deleted successfully'
        ]);
    }

    /**
     * Get the next available invoice number
     */
    public function getNextInvoiceNumber(): JsonResponse
    {
        $lastInvoice = Invoice::orderBy('id', 'desc')->first();
        
        if (!$lastInvoice) {
            $invoice_no = 'INV-1001';
        } else {
            $lastNo = $lastInvoice->invoice_no;
            // Extract number from INV-XXXX
            preg_match('/INV-(\d+)/', $lastNo, $matches);
            $number = isset($matches[1]) ? (int)$matches[1] : 1000;
            $invoice_no = 'INV-' . ($number + 1);
        }

        return response()->json([
            'invoice_no' => $invoice_no,
            'success' => true
        ]);
    }
}
