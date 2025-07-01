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
        const applier = rangy.createClassApplier('highlight', {
            elementTagName: 'span',
            normalize: true,
        });
        setHighlighter(applier);

        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection.rangeCount === 0 || selection.isCollapsed) {
                setShowPopover(false);
                return;
            }

            const range = selection.getRangeAt(0);
            const text = range.toString().trim();

            if (text && contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
                const rect = range.getBoundingClientRect();
                setPopoverPosition({
                    top: rect.top - 40 + window.scrollY,
                    left: rect.left + rect.width / 2 - 40 + window.scrollX
                });
                setSelectedText(text);
                setSelectedRange(range);
                setShowPopover(true);
            } else {
                setShowPopover(false);
            }
        };

        const handleDocumentClick = (e) => {
            if (contentRef.current && !contentRef.current.contains(e.target)) {
                setShowPopover(false);
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mousedown', handleDocumentClick);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []);

    const applyHighlights = useCallback((applier) => {
        if (!applier || !contentRef.current || !highlights) return;

        // Create a range that covers the entire content area and undo all highlights.
        const contentRange = rangy.createRange();
        contentRange.selectNodeContents(contentRef.current);
        applier.undoToRange(contentRange);

        // Re-apply all current highlights from the state.
        highlights.forEach(highlight => {
            try {
                const range = rangy.deserializeRange(highlight.serialized_range, contentRef.current);
                applier.applyToRange(range);
            } catch (e) {
                console.error('Failed to apply highlight:', e);
            }
        });
    }, [highlights]);

    useEffect(() => {
        if (highlighter && contentRef.current) {
            const timer = setTimeout(() => applyHighlights(highlighter), 0);
            return () => clearTimeout(timer);
        }
    }, [highlighter, highlights, children, applyHighlights]);

    const handleHighlight = () => {
        if (!selectedText || !highlighter || !selectedRange) return;

        const rangyRange = rangy.createRange();
        rangyRange.setStart(selectedRange.startContainer, selectedRange.startOffset);
        rangyRange.setEnd(selectedRange.endContainer, selectedRange.endOffset);
        
        const serializedRange = rangy.serializeRange(rangyRange, true, contentRef.current);
        
        onAddHighlight({
            serialized_range: serializedRange,
            selected_text: selectedText,
        });
        
        window.getSelection().removeAllRanges();
        setShowPopover(false);
    };

    return (
        <div ref={contentRef} style={{ position: 'relative' }}>
          {children}
          {showPopover && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                        zIndex: 1000,
                    }}
                    className="p-1"
                >
                    <button 
                        onClick={handleHighlight}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md shadow-lg hover:bg-red-700 transition-colors"
                    >
                        Highlight
                    </button>
                </div>
            )}
            {children}
            <style>{`
                .highlight {
                    background-color: rgba(239, 68, 68, 0.4);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default HighlightHandler;
