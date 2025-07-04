import React, { useState, useEffect, useRef, useCallback } from 'react';
import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier';
import 'rangy/lib/rangy-serializer';

const HighlightHandler = ({ children, highlights, onAddHighlight }) => {
    const contentRef = useRef(null);
    const [highlighter, setHighlighter] = useState(null);
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const [selectedText, setSelectedText] = useState('');
    const [selectedRange, setSelectedRange] = useState(null);

    useEffect(() => {
        rangy.init();
        const applier = rangy.createClassApplier('highlight-red', {
            elementTagName: 'span',
            normalize: true,
        });
        setHighlighter(applier);

        const handleMouseUp = () => {
            const selection = rangy.getSelection();
            if (selection.isCollapsed) {
                if (showPopover) setShowPopover(false);
                return;
            }

            const range = selection.getRangeAt(0);
            const text = range.toString().trim();

            if (text && contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
                const rect = range.getBoundingClientRect();
                setPopoverPosition({
                    top: rect.top - 50 + window.scrollY,
                    left: rect.left + rect.width / 2 - 40 + window.scrollX
                });
                setSelectedText(text);
                setSelectedRange(range);
                setShowPopover(true);
            } else {
                if (showPopover) setShowPopover(false);
            }
        };
        
        const handleDocumentClick = (e) => {
            if (showPopover && !e.target.closest('.highlight-popover')) {
                setShowPopover(false);
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('click', handleDocumentClick, true); // Use capture phase

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('click', handleDocumentClick, true);
        };
    }, [showPopover]);

    const applyHighlights = useCallback((applier) => {
        if (!applier || !contentRef.current || !highlights) return;

        applier.undoToRange(rangy.createRange(document.body));

        highlights.forEach(highlight => {
            try {
                const range = rangy.deserializeRange(highlight.serialized_range, contentRef.current, document);
                applier.applyToRange(range);
            } catch (e) {
                console.error('Failed to apply highlight:', e, highlight.serialized_range);
            }
        });
    }, [highlights]);

    useEffect(() => {
        if (highlighter && contentRef.current) {
            const timer = setTimeout(() => applyHighlights(highlighter), 100);
            return () => clearTimeout(timer);
        }
    }, [highlighter, highlights, children, applyHighlights]);

    const handleHighlight = () => {
        if (!selectedText || !highlighter || !selectedRange) return;
        
        const serializedRange = rangy.serializeRange(selectedRange, true, contentRef.current);
        
        onAddHighlight({
            serialized_range: serializedRange,
            selected_text: selectedText,
        });

        highlighter.applyToRange(selectedRange);
        setShowPopover(false);
        rangy.getSelection().removeAllRanges();
    };

    return (
        <div ref={contentRef} style={{ position: 'relative' }}>
          {children}
          {showPopover && (
                <div
                    className="highlight-popover bg-gray-800 border border-gray-600 rounded-md shadow-lg p-1"
                    style={{
                        position: 'absolute',
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                        zIndex: 1000,
                    }}
                >
                    <button
                        onClick={handleHighlight}
                        className="px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                        Highlight
                    </button>
                </div>
            )}
            <style>{`
                .highlight-red {
                    background-color: rgba(239, 68, 68, 0.4);
                }
            `}</style>
        </div>
    );
};

export default HighlightHandler;
