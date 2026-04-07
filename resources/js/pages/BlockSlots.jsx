import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockTimeSlot } from '../services/api';

export default function BlockSlots() {
    const navigate = useNavigate();
    const [blockData, setBlockData] = useState({ booking_date: '', start_time: '09:00', end_time: '10:00' });

    const handleBlockTimeSlot = async (e) => {
        e.preventDefault();
        try {
            await blockTimeSlot(blockData.booking_date, blockData.start_time, blockData.end_time);
            setBlockData({ booking_date: '', start_time: '09:00', end_time: '10:00' });
            navigate('/manage');
        } catch (e) { 
            alert('Failed to block time slot. ' + (e.response?.data?.message || ''));
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                            <input type="time" required value={blockData.start_time} onChange={e => setBlockData({...blockData, start_time: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End Time</label>
                            <input type="time" required value={blockData.end_time} onChange={e => setBlockData({...blockData, end_time: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-4 bg-max-navy text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all text-xs">
                        Block Slot
                    </button>
                </form>
            </div>
        </div>
    );
}
