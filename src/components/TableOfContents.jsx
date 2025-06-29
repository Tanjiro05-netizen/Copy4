import React, { useState, useEffect, useRef } from 'react';

const TableOfContents = ({ contentRef }) => {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const observer = useRef(null);

    useEffect(() => {
        if (!contentRef.current) return;

        const headingElements = Array.from(
            contentRef.current.querySelectorAll('h2, h3, h4')
        );

        setHeadings(headingElements.map(h => ({
            id: h.id,
            text: h.innerText,
            level: Number(h.tagName.substring(1))
        })));

    }, [contentRef, contentRef.current]); // Rerun when content is loaded

    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0% 0% -80% 0%' } // Trigger when heading is at the top 20% of the screen
        );

        const elements = contentRef.current.querySelectorAll('h2, h3, h4');
        elements.forEach(el => observer.current.observe(el));

        return () => observer.current.disconnect();
    }, [headings, contentRef]);

    const handleLinkClick = (e, id) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    if (headings.length === 0) {
        return null; // Don't render if there are no headings
    }

    return (
        <nav className="sticky top-24 p-4 bg-gray-800/50 rounded-lg border border-gray-700 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-3">On this page</h3>
            <ul>
                {headings.map(heading => (
                    <li key={heading.id} style={{ marginLeft: `${(heading.level - 2) * 1}rem` }}>
                        <a 
                            href={`#${heading.id}`}
                            onClick={(e) => handleLinkClick(e, heading.id)}
                            className={`block py-1 text-sm transition-colors duration-200 ${activeId === heading.id ? 'text-red-400 font-semibold' : 'text-gray-400 hover:text-white'}`}>
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default TableOfContents;
