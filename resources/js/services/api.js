// services/api.js
const API_BASE_URL = '/api/bookings';

/**
 * Get schedule for a specific date
 */
export const getSchedule = async (date) => {
    try {
        const response = await fetch(`${API_BASE_URL}/schedule?date=${date}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching schedule:', error);
        throw error;
    }
};

/**
 * Get all bookings (admin)
 */
export const getBookings = async (filters = {}) => {
    try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}?${params}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify(bookingData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

/**
 * Get suggested time slots
 */
export const getSuggestions = async (date, time) => {
    try {
        const response = await fetch(`${API_BASE_URL}/suggestions?date=${date}&time=${time}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        throw error;
    }
};

/**
 * Delete a booking (admin)
 */
export const deleteBooking = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};

/**
 * Block a time slot (admin)
 */
export const blockTimeSlot = async (date, time) => {
    try {
        const response = await fetch(`${API_BASE_URL}/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify({ booking_date: date, booking_time: time }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error blocking time slot:', error);
        throw error;
    }
};

/**
 * Update an existing booking (admin)
 */
export const updateBooking = async (id, bookingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify(bookingData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

/**
 * Get all customers
 */
export const getCustomers = async () => {
    try {
        const response = await fetch('/api/customers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

/**
 * Create a new customer
 */
export const createCustomer = async (customerData) => {
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify(customerData),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Validation failed');
        }
        return data;
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
};

/**
 * Update an existing customer
 */
export const updateCustomer = async (id, customerData) => {
    try {
        const response = await fetch(`/api/customers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify(customerData),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Update failed');
        }
        return data;
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
};

/**
 * Get customer stats and history
 */
export const getCustomerStats = async (id) => {
    try {
        const response = await fetch(`/api/customers/${id}/stats`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        throw error;
    }
};
