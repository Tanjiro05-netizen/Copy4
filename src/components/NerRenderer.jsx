import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import GlossaryPopup from './GlossaryPopup';

const Entity = ({ text, type, term, onEntityClick }) => {
    let colorClass = 'text-yellow-300';
    let typeLabel = 'Entity';

    switch (type) {
        case 'person':
            colorClass = 'bg-blue-500 bg-opacity-20 text-blue-300';
            typeLabel = 'Person';
            break;
        case 'place':
            colorClass = 'bg-green-500 bg-opacity-20 text-green-300';
            typeLabel = 'Place';
            break;
        case 'organization':
            colorClass = 'bg-purple-500 bg-opacity-20 text-purple-300';
            typeLabel = 'Organization';
            break;
        default:
            break;
    }

    const isClickable = term && term.explanation;
    const cursorClass = isClickable ? 'cursor-pointer' : 'cursor-default';

    return (
        <span 
            className={`${colorClass} rounded px-1 py-0.5 ${cursorClass}`}
            title={typeLabel}
            onClick={() => isClickable && onEntityClick(term)}
        >
            {text}
        </span>
    );
};

const NerRenderer = ({ children, entities }) => {
    const [glossary, setGlossary] = useState(new Map());
    const [selectedTerm, setSelectedTerm] = useState(null);

    useEffect(() => {
        const fetchGlossary = async () => {
            const { data, error } = await supabase.from('glossary').select('term, type, explanation, url');
            if (error) {
                console.error('Error fetching glossary:', error);
                return;
            }
            const glossaryMap = new Map(data.map(item => [item.term.toLowerCase(), item]));
            setGlossary(glossaryMap);
        };

        fetchGlossary();
    }, []);
    const allEntities = [
        ...(entities.people || []).map(e => ({ text: e, type: 'person' })),
        ...(entities.places || []).map(e => ({ text: e, type: 'place' })),
        ...(entities.organizations || []).map(e => ({ text: e, type: 'organization' })),
    ]
    .filter(e => e.text && e.text.trim() !== '')
    .sort((a, b) => b.text.length - a.text.length);

    if (allEntities.length === 0) {
        return <>{children}</>;
    }

    const entityMap = new Map();
    allEntities.forEach(e => entityMap.set(e.text.toLowerCase(), e.type));

    const entityTexts = allEntities.map(e => e.text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${entityTexts.join('|')})\\b`, 'gi');

    const handleEntityClick = (term) => {
        setSelectedTerm(term);
    };

    const processNode = (node) => {
        if (typeof node === 'string') {
            const parts = node.split(regex);
            return parts.reduce((acc, part, i) => {
                if (i % 2 === 1) { // This is an entity match
                    const lowerCasePart = part.toLowerCase();
                    const type = entityMap.get(lowerCasePart);
                    const term = glossary.get(lowerCasePart);
                    acc.push(<Entity key={`${part}-${i}`} text={part} type={type} term={term} onEntityClick={handleEntityClick} />);
                } else {
                    acc.push(part);
                }
                return acc;
            }, []);
        } else if (React.isValidElement(node) && node.props.children) {
            return React.cloneElement(node, {
                ...node.props,
                children: React.Children.map(node.props.children, processNode)
            });
        } else {
            return node;
        }
    };

    return (
        <>
            {React.Children.map(children, processNode)}
            <GlossaryPopup term={selectedTerm} onClose={() => setSelectedTerm(null)} />
        </>
    );
};

export default NerRenderer;
