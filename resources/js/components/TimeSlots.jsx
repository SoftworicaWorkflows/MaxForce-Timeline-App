import React from 'react';
import { Clock, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

const TimeSlots = ({ slots, onSlotSelect, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-max-navy"></div>
                    <span className="text-gray-400 font-medium animate-pulse">Checking availability...</span>
                </div>
            </div>
        );
    }

    if (!slots || slots.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-medium">No time slots available for this date.</p>
            </div>
        );
    }

    const groupedSlots = slots.reduce((acc, slot) => {
        const hour = parseInt(slot.time.split(':')[0]);
        const period = hour >= 12 ? 'Afternoon' : 'Morning';
        if (!acc[period]) acc[period] = [];
        acc[period].push(slot);
        return acc;
    }, {});

    const getSlotStyles = (status) => {
        switch (status) {
            case 'booked':
                return 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200';
            case 'available':
                return 'bg-white text-max-navy border-gray-100 hover:border-max-lime hover:shadow-lg hover:shadow-max-lime/10 hover:-translate-y-1 cursor-pointer group';
            case 'suggested':
                return 'bg-max-navy text-white border-max-navy hover:shadow-lg hover:shadow-max-navy/20 hover:-translate-y-1 cursor-pointer shadow-md scale-[1.02]';
            default:
                return 'bg-white text-gray-800 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'booked':
                return 'NOT AVAILABLE';
            case 'available':
                return 'AVAILABLE';
            case 'suggested':
                return 'SUGGESTED';
            default:
                return '';
        }
    };

    return (
        <div className="space-y-8">
            {['Morning', 'Afternoon'].map((period) =>
                groupedSlots[period] ? (
                    <div key={period} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px bg-gray-100 flex-1"></div>
                            <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">
                                {period} Sessions
                            </h3>
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {groupedSlots[period].map((slot) => (
                                <button
                                    key={slot.time}
                                    onClick={() =>
                                        slot.status !== 'booked' && onSlotSelect(slot)
                                    }
                                    disabled={slot.status === 'booked'}
                                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-300 font-bold ${getSlotStyles(
                                        slot.status
                                    )}`}
                                >
                                    <span className="text-lg tracking-tight mb-1">{slot.label}</span>
                                    <span className={`text-[10px] tracking-widest font-black ${
                                        slot.status === 'available' ? 'text-max-lime group-hover:text-max-lime' : 
                                        slot.status === 'suggested' ? 'text-max-lime' : 'text-gray-300'
                                    }`}>
                                        {getStatusLabel(slot.status)}
                                    </span>
                                    
                                    {slot.status === 'available' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-max-lime rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null
            )}
            
            {/* Legend / Key */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-[10px] font-bold text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-white border-2 border-gray-100"></div>
                    <span className="uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-max-navy"></div>
                    <span className="uppercase tracking-widest">Suggested Slot</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-100"></div>
                    <span className="uppercase tracking-widest">Booked</span>
                </div>
            </div>
        </div>
    );
};

export default TimeSlots;
