import React, { useState, useEffect } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import BiographicalEvents from './sections/BiographicalEvents';
import AcademicEvents from './sections/AcademicEvents';
import PublicationEvents from './sections/PublicationEvents';
import OrganizationalEvents from './sections/OrganizationalEvents';
import HistoricalEvents from './sections/HistoricalEvents';

const Timeline = () => {
    const [activeEvent, setActiveEvent] = useState(null);
    const [filter, setFilter] = useState('all');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const allEvents = [
        ...BiographicalEvents.map(e => ({ ...e, type: 'biography', category: 'Biography' })),
        ...AcademicEvents.map(e => ({ ...e, type: 'academic', category: 'Academic' })),
        ...PublicationEvents.map(e => ({ ...e, type: 'publication', category: 'Publication' })),
        ...OrganizationalEvents.map(e => ({ ...e, type: 'organization', category: 'Organization' })),
        ...HistoricalEvents.map(e => ({ ...e, type: 'historical', category: 'Historical Event' }))
    ].sort((a, b) => a.year - b.year);

    const filteredEvents = filter === 'all' 
        ? allEvents 
        : allEvents.filter(event => event.type === filter);

    const categories = [
        { id: 'all', name: 'All' },
        { id: 'biography', name: 'Biography' },
        { id: 'academic', name: 'Academic' },
        { id: 'publication', name: 'Publication' },
        { id: 'organization', name: 'Organization' },
        { id: 'historical', name: 'Historical Event' }
    ];

    return (
        <div className="relative px-4 md:px-8">
            {/* Category Filter */}
            <div className="sticky top-4 z-20 mb-8">
                <div className="max-w-fit mx-auto bg-black/60 backdrop-blur-md rounded-lg p-2 flex flex-wrap gap-2 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setFilter(cat.id);
                                // Prevent scroll jump
                                window.scrollTo({
                                    top: window.scrollY,
                                    behavior: 'instant'
                                });
                            }}
                            className={`px-4 py-2 rounded-md transition-all ${
                                filter === cat.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rest of the Timeline component remains the same */}
            {/* Scroll to Top Button */}
            <div className={`fixed bottom-8 right-8 z-20 transition-opacity duration-300 ${
                isScrolled ? 'opacity-100' : 'opacity-0'
            }`}>
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-red-600 p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                >
                    <ChevronDown className="w-6 h-6 text-white transform rotate-180" />
                </button>
            </div>

            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5">
                <div className="h-full w-full bg-gradient-to-b from-red-900/50 via-red-600/50 to-red-900/50">
                    <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-b from-transparent via-red-500/30 to-transparent"></div>
                </div>
            </div>

            {/* Timeline Events */}
            <div className="space-y-16">
                {filteredEvents.map((event, index) => (
                    <div
                        key={`${event.year}-${index}`}
                        className={`relative flex items-center ${
                            index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                        }`}
                    >
                        <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                            <div
                                className={`group bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-red-900/20 
                                    transform transition-all duration-300 hover:scale-105 hover:border-red-500/40
                                    ${activeEvent === index ? 'border-red-500 animate-glow' : ''}
                                    animate-slideIn cursor-pointer`}
                                onMouseEnter={() => setActiveEvent(index)}
                                onMouseLeave={() => setActiveEvent(null)}
                            >
                                <div className="text-red-500 text-sm mb-2 flex items-center gap-2">
                                    {event.category}
                                </div>
                                <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                                    {event.title}
                                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-gray-400 mb-4">{event.description}</p>
                                
                                {event.image && (
                                    <div className="mt-4 overflow-hidden rounded-lg">
                                        <img 
                                            src={event.image} 
                                            alt={event.title}
                                            className="w-full h-32 object-cover transform transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Center Point */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                            <div className="relative">
                                <div className={`w-4 h-4 rounded-full bg-red-600 border-4 border-gray-900 
                                    ${activeEvent === index ? 'animate-pulse-slow' : ''}`}>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                            </div>
                            <div className="text-red-500 font-mono mt-2 font-bold">{event.year}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;