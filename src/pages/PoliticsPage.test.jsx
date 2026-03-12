import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PoliticsPage from './PoliticsPage';
import { supabase } from '../supabaseClient';

jest.mock('../supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

const buildPoliticsQuery = (articles = []) => {
    const query = {
        data: articles,
        error: null,
        select: jest.fn(() => query),
        or: jest.fn(() => query),
        eq: jest.fn(() => query),
        ilike: jest.fn(() => query),
        order: jest.fn(() => query),
    };

    return query;
};

const buildArchiveQuery = (editionDates = []) => {
    const query = {
        select: jest.fn(() => query),
        order: jest.fn(() => query),
        limit: jest.fn().mockResolvedValue({
            data: editionDates.map((editionDate) => ({ edition_date: editionDate })),
            error: null,
        }),
    };

    return query;
};

describe('PoliticsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('queries published edition dispatches and refetches on edition-date change', async () => {
        const today = new Date().toISOString().slice(0, 10);

        const archiveQuery = buildArchiveQuery([today]);
        const initialQuery = buildPoliticsQuery([]);
        const changedDateQuery = buildPoliticsQuery([]);

        let fromCallCount = 0;

        supabase.from.mockImplementation((table) => {
            expect(table).toBe('politics_articles');
            fromCallCount += 1;

            if (fromCallCount === 1) return archiveQuery;
            if (fromCallCount === 2) return initialQuery;
            return changedDateQuery;
        });

        render(
            <MemoryRouter
                initialEntries={[`/?edition=${today}`]}
                future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
                <PoliticsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(initialQuery.or).toHaveBeenCalledWith('status.eq.published,status.is.null');
            expect(initialQuery.eq).toHaveBeenCalledWith('edition_date', today);
        });

        fireEvent.change(screen.getByLabelText('Edition date'), {
            target: { value: '2026-03-01' },
        });

        await waitFor(() => {
            expect(changedDateQuery.eq).toHaveBeenCalledWith('edition_date', '2026-03-01');
        });
    });

    test('prefers explicit lead placement for the hero story', async () => {
        const today = new Date().toISOString().slice(0, 10);

        const archiveQuery = buildArchiveQuery([today]);
        const query = buildPoliticsQuery([
            {
                id: 'story-side-1',
                slug: 'side-first',
                title: 'Side Story First',
                excerpt: 'Side excerpt',
                category: 'analysis',
                source: 'Desk',
                placement: 'side',
                created_at: '2026-03-01T10:00:00.000Z',
                status: 'published',
                edition_date: today,
            },
            {
                id: 'story-lead-2',
                slug: 'lead-second',
                title: 'Lead Story Second',
                excerpt: 'Lead excerpt',
                category: 'analysis',
                source: 'Desk',
                placement: 'lead',
                created_at: '2026-03-01T09:00:00.000Z',
                status: 'published',
                edition_date: today,
            },
        ]);

        let fromCallCount = 0;
        supabase.from.mockImplementation((table) => {
            expect(table).toBe('politics_articles');
            fromCallCount += 1;
            return fromCallCount === 1 ? archiveQuery : query;
        });

        render(
            <MemoryRouter
                initialEntries={[`/?edition=${today}`]}
                future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
                <PoliticsPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('heading', { level: 2, name: 'Lead Story Second' })).toBeInTheDocument();

        expect(screen.getByRole('link', { name: /read dispatch/i })).toHaveAttribute(
            'href',
            `/politics/lead-second?edition=${today}`
        );
    });
});
