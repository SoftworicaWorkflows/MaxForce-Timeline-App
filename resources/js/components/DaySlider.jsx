import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DaySlider = ({ selectedDate, onDateSelect }) => {
    const scrollRef = useRef(null);
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
    });

    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getDayLabel = (date) => {
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return { day, dayNum, month };
    };

    return (
        <div className="w-full bg-white shadow-md rounded-xl p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-max-navy" />
                    <h2 className="text-xl font-bold text-max-navy">Select a Date</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleScroll('left')}
                        className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-max-navy shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => handleScroll('right')}
                        className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-max-navy shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {days.map((date) => {
                        const dateStr = formatDate(date);
                        const { day, dayNum, month } = getDayLabel(date);
                        const isSelected = dateStr === selectedDate;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => onDateSelect(dateStr)}
                                className={`flex flex-col items-center min-w-[70px] py-4 rounded-xl transition-all duration-300 transform snap-start border-2 ${
                                    isSelected
                                        ? 'bg-max-navy text-white border-max-navy shadow-lg scale-105 -translate-y-1'
                                        : 'bg-white text-gray-500 border-gray-50 hover:border-max-lime hover:bg-max-lime/5 hover:text-max-navy'
                                }`}
                            >
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-max-lime' : 'text-gray-300'}`}>
                                    {day}
                                </span>
                                <span className="text-xl font-black mb-1">{dayNum}</span>
                                <span className="text-[10px] font-bold opacity-60 uppercase">{month}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DaySlider;
