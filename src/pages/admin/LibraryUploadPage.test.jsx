import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LibraryUploadPage from './LibraryUploadPage';
import { supabase } from '../../supabaseClient';

const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [mockSearchParams, jest.fn()],
    };
});

jest.mock('../../supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
        storage: {
            from: jest.fn(),
        },
    },
}));

jest.mock('./AudiobookUploadForm', () => () => <div>Audiobook form</div>);

const buildFetchBookQuery = (book) => {
    const query = {
        select: jest.fn(() => query),
        eq: jest.fn(() => query),
        single: jest.fn().mockResolvedValue({ data: book, error: null }),
    };

    return query;
};

const buildUpdateBookQuery = () => {
    const query = {
        update: jest.fn(() => query),
        eq: jest.fn().mockResolvedValue({ error: null }),
    };

    return query;
};

const setupEditBookMocks = ({ book, updateQuery = buildUpdateBookQuery() }) => {
    const fetchQuery = buildFetchBookQuery(book);
    const queue = [fetchQuery, updateQuery];

    supabase.from.mockImplementation((tableName) => {
        if (tableName !== 'digital_library_books') {
            throw new Error(`Unexpected table ${tableName}`);
        }
        const next = queue.shift();
        if (!next) throw new Error('No mock query queued');
        return next;
    });

    return { fetchQuery, updateQuery };
};

const setupStorageMocks = () => {
    const libraryStorage = {
        upload: jest.fn().mockResolvedValue({ error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn((path) => ({ data: { publicUrl: `https://library.test/${path}` } })),
    };
    const coverStorage = {
        upload: jest.fn().mockResolvedValue({ error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn((path) => ({ data: { publicUrl: `https://covers.test/${path}` } })),
    };

    supabase.storage.from.mockImplementation((bucket) => {
        if (bucket === 'library') return libraryStorage;
        if (bucket === 'covers') return coverStorage;
        throw new Error(`Unexpected bucket ${bucket}`);
    });

    return { libraryStorage, coverStorage };
};

const existingBook = {
    id: 'book-1',
    title: 'Existing Book',
    author: 'Old Author',
    year: 1917,
    description: 'Existing description',
    category: 'History',
    era: '20th Century',
    language: 'English',
    pages: 321,
    is_official: true,
    epub_filename: 'epub-existing-book.epub',
    pdf_filename: 'old.pdf',
    cover_image_url: 'https://example.supabase.co/storage/v1/object/public/covers/old-cover.jpg',
};

describe('LibraryUploadPage ebook editing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockReset();
        mockSearchParams = new URLSearchParams();
        setupStorageMocks();
    });

    test('requires an EPUB for new ebook uploads', () => {
        render(<LibraryUploadPage />);

        fireEvent.change(screen.getByPlaceholderText('e.g., Capital Volume I'), {
            target: { name: 'title', value: 'New Book' },
        });

        expect(screen.queryByText('PDF Pages')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Upload Book' })).toBeDisabled();
    });

    test('loads an existing ebook and can save metadata without uploading a new EPUB', async () => {
        mockSearchParams = new URLSearchParams('edit=book&id=book-1');
        const { updateQuery } = setupEditBookMocks({
            book: { ...existingBook, pdf_filename: null, cover_image_url: null },
        });

        render(<LibraryUploadPage />);

        expect(await screen.findByDisplayValue('Existing Book')).toBeInTheDocument();
        expect(screen.getByText('epub-existing-book.epub')).toBeInTheDocument();
        expect(screen.queryByText('PDF Pages')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();

        fireEvent.change(screen.getByPlaceholderText('e.g., Karl Marx'), {
            target: { name: 'author', value: 'New Author' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

        await waitFor(() => {
            expect(updateQuery.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    author: 'New Author',
                    pdf_filename: null,
                    cover_image_url: null,
                })
            );
        });

        expect(updateQuery.update.mock.calls[0][0]).not.toHaveProperty('epub_filename');
    });

    test('can add a PDF to an existing ebook that does not have one', async () => {
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
        mockSearchParams = new URLSearchParams('edit=book&id=book-1');
        const { updateQuery } = setupEditBookMocks({
            book: { ...existingBook, pdf_filename: null, cover_image_url: null },
        });
        const { libraryStorage } = setupStorageMocks();

        render(<LibraryUploadPage />);

        await screen.findByDisplayValue('Existing Book');

        const pdf = new File(['pdf'], 'download.pdf', { type: 'application/pdf' });
        fireEvent.change(screen.getByLabelText('Click to upload PDF'), {
            target: { files: [pdf] },
        });
        expect(screen.getByText('PDF Pages')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('e.g., 500'), {
            target: { name: 'pages', value: '88' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

        await waitFor(() => {
            expect(libraryStorage.upload).toHaveBeenCalledWith(
                'pdf-existing-book-1710000000000.pdf',
                pdf,
                { cacheControl: '3600', upsert: false }
            );
        });

        await waitFor(() => {
            expect(updateQuery.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    pdf_filename: 'pdf-existing-book-1710000000000.pdf',
                    pages: 88,
                })
            );
        });

        nowSpy.mockRestore();
    });

    test('replaces PDF and cover, then deletes the old storage files', async () => {
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
        mockSearchParams = new URLSearchParams('edit=book&id=book-1');
        const { updateQuery } = setupEditBookMocks({ book: existingBook });
        const { libraryStorage, coverStorage } = setupStorageMocks();

        render(<LibraryUploadPage />);

        await screen.findByDisplayValue('Existing Book');

        fireEvent.click(screen.getByRole('button', { name: 'Remove PDF' }));
        fireEvent.change(screen.getByLabelText('Click to upload PDF'), {
            target: { files: [new File(['new pdf'], 'replacement.pdf', { type: 'application/pdf' })] },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Remove cover' }));
        fireEvent.change(screen.getByLabelText('Click to upload cover'), {
            target: { files: [new File(['cover'], 'replacement.jpg', { type: 'image/jpeg' })] },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

        await waitFor(() => {
            expect(updateQuery.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    pdf_filename: 'pdf-existing-book-1710000000000.pdf',
                    cover_image_url: 'https://covers.test/cover-existing-book-1710000000000.jpg',
                })
            );
        });

        await waitFor(() => {
            expect(libraryStorage.remove).toHaveBeenCalledWith(['old.pdf']);
            expect(coverStorage.remove).toHaveBeenCalledWith(['old-cover.jpg']);
        });
        nowSpy.mockRestore();
    });

    test('removes existing PDF and cover and cleans up their storage files', async () => {
        mockSearchParams = new URLSearchParams('edit=book&id=book-1');
        const { updateQuery } = setupEditBookMocks({ book: existingBook });
        const { libraryStorage, coverStorage } = setupStorageMocks();

        render(<LibraryUploadPage />);

        await screen.findByDisplayValue('Existing Book');

        fireEvent.click(screen.getByRole('button', { name: 'Remove PDF' }));
        fireEvent.click(screen.getByRole('button', { name: 'Remove cover' }));
        fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

        await waitFor(() => {
            expect(updateQuery.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    pdf_filename: null,
                    cover_image_url: null,
                    pages: null,
                })
            );
        });

        expect(libraryStorage.upload).not.toHaveBeenCalled();
        expect(coverStorage.upload).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(libraryStorage.remove).toHaveBeenCalledWith(['old.pdf']);
            expect(coverStorage.remove).toHaveBeenCalledWith(['old-cover.jpg']);
        });
    });
});
