import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextEditionReader from './TextEditionReader';

/* Project convention (see PoliticsArticleReader.test.jsx): react-markdown and
   remark-gfm ship ESM that jest can't transform, so they are mocked as a
   passthrough. */
jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="markdown">{children}</div>,
}));
jest.mock('remark-gfm', () => ({
    __esModule: true,
    default: () => null,
}));

const book = {
    title: 'The Cycle of Accumulation',
    author: 'International Communist Party',
    year: 1976,
    category: 'Political Economy',
    era: '20th Century',
    language: 'English',
};

const edition = {
    sections: [
        { id: 's1', title: 'Front matter', level: 1, md: 'An introduction paragraph.' },
        {
            id: 's2',
            title: 'Chapter One',
            level: 1,
            md: 'The first chapter body.\n\n| Col A | Col B |\n| --- | --- |\n| 1 | 2 |',
        },
    ],
    reading_minutes: 3,
    source: 'txt',
};

describe('TextEditionReader', () => {
    it('renders the metadata header, numbered rail and markdown bodies', () => {
        render(<TextEditionReader book={book} edition={edition} />);

        expect(screen.getByRole('heading', { level: 1, name: 'The Cycle of Accumulation' })).toBeInTheDocument();
        expect(screen.getByText(/International Communist Party/)).toBeInTheDocument();
        expect(screen.getByText(/3 min read/)).toBeInTheDocument();

        // Category is the kicker; tags carry era + language (no duplicate)
        expect(screen.getByText('Political Economy', { selector: '.kicker, p' })).toBeInTheDocument();
        expect(screen.getByText('20th Century')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();

        const rail = screen.getByRole('navigation', { name: 'Sections' });
        expect(rail).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /01\s*Front matter/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /02\s*Chapter One/ })).toBeInTheDocument();

        const markdownBlocks = screen.getAllByTestId('markdown');
        expect(markdownBlocks).toHaveLength(2);
        expect(markdownBlocks[0].textContent).toBe('An introduction paragraph.');
        expect(markdownBlocks[1].textContent).toContain('| Col A | Col B |');

        expect(document.querySelector('[data-section-canonical="s1"]')).toBeInTheDocument();
        expect(document.querySelector('[data-paper-section="true"]')).toBeInTheDocument();
    });

    it('renders the footer with back-to-library and the PDF edition link', () => {
        render(<TextEditionReader book={book} edition={edition} pdfUrl="https://example.com/book.pdf" />);

        const back = screen.getByRole('link', { name: /back to the library/i });
        expect(back).toHaveAttribute('href', '/digital-library');

        const pdf = screen.getByRole('link', { name: /pdf — fixed-page edition/i });
        expect(pdf).toHaveAttribute('href', 'https://example.com/book.pdf');
    });

    it('hides the PDF footer link when no PDF exists (text-only edition)', () => {
        render(<TextEditionReader book={book} edition={edition} />);
        expect(screen.queryByRole('link', { name: /fixed-page edition/i })).toBeNull();
    });

    it('never renders markdown content as raw HTML', () => {
        render(
            <TextEditionReader
                book={book}
                edition={{ sections: [{ id: 's1', title: 'T', level: 1, md: '<script>alert(1)</script>' }] }}
            />
        );
        expect(document.querySelector('script')).toBeNull();
        expect(screen.getByTestId('markdown').textContent).toContain('<script>');
    });

    it('shows the empty-edition fallback when there are no sections', () => {
        render(<TextEditionReader book={book} edition={{ sections: [] }} pdfUrl="https://example.com/book.pdf" />);
        expect(screen.getByTestId('text-edition-reader-empty')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /open the pdf directly/i })).toHaveAttribute(
            'href',
            'https://example.com/book.pdf'
        );
    });

    it('reports document-scroll progress through the callback', () => {
        const onProgressChange = jest.fn();
        render(<TextEditionReader book={book} edition={edition} onProgressChange={onProgressChange} />);

        // jsdom has no layout: rects are zero, so progress resolves to 0
        fireEvent.scroll(window);
        expect(onProgressChange).toHaveBeenCalledWith(0);
    });
});
