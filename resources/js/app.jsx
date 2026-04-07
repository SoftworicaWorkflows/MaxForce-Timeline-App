import './bootstrap';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import PublicSchedule from './pages/PublicSchedule';
import ManageBookings from './pages/ManageBookings';
import AddCustomer from './pages/AddCustomer';
import ManageCustomers from './pages/ManageCustomers';
import BlockSlots from './pages/BlockSlots';
import Settings from './pages/Settings';
import ActivityLog from './pages/ActivityLog';
import '../css/app.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B365D]"></div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={isLoggedIn ? <Navigate to="/schedule" /> : <Login />} />
                
                {/* Admin/Dashboard Layout routes */}
                {isLoggedIn && (
                    <Route element={<AdminLayout />}>
                        <Route path="/schedule" element={<PublicSchedule />} />
                        <Route path="/manage" element={<ManageBookings />} />
                        <Route path="/customers" element={<ManageCustomers />} />
                        <Route path="/create" element={<AddCustomer />} />
                        <Route path="/block" element={<BlockSlots />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/activity" element={<ActivityLog />} />
                    </Route>
                )}
                
                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
