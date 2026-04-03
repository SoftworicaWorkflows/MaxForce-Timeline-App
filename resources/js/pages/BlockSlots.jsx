import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockTimeSlot } from '../services/api';

export default function BlockSlots() {
    const navigate = useNavigate();
    const [blockData, setBlockData] = useState({ booking_date: '', booking_time: '' });

    const handleBlockTimeSlot = async (e) => {
        e.preventDefault();
        try {
            await blockTimeSlot(blockData.booking_date, blockData.booking_time);
            setBlockData({ booking_date: '', booking_time: '' });
            navigate('/manage');
        } catch (e) { 
            alert('Failed to block time slot.'); 
        }
    };

    return (
        <div className="max-w-xl animate-in slide-in-from-right-4 duration-500 pt-4">
            <h2 className="text-3xl font-black text-max-navy tracking-tight mb-2">Block Slots</h2>
            <p className="text-xs text-gray-500 font-medium tracking-widest uppercase mb-8">Mark specific times as unavailable.</p>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleBlockTimeSlot} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date to Block</label>
                        <input type="date" required value={blockData.booking_date} onChange={e => setBlockData({...blockData, booking_date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time to Block</label>
                        <input type="time" required value={blockData.booking_time} onChange={e => setBlockData({...blockData, booking_time: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                    </div>
                    <button type="submit" className="w-full mt-4 bg-max-navy text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all text-xs">
                        Block Slot
                    </button>
                </form>
            </div>
        </div>
    );
}
