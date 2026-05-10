// Create a mock Supabase client
const createMockSupabase = () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  data: [],
  error: null,
  // Add any other Supabase methods your app uses
});

// Create a mock instance
export const mockSupabase = createMockSupabase();

// Mock the default export
const supabase = {
  supabase: mockSupabase,
};

export default supabase;
