import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Mock the Analytics component
const mockAnalytics = () => <div data-testid="analytics" />;

// Mock the MainLayout component
const MockMainLayout = ({ children }) => (
  <div data-testid="main-layout">{children}</div>
);

// Mock the Header component
const MockHeader = () => <div data-testid="header">Header</div>;

// Test user ID that matches UUID format
// This is a valid UUID v4 format that should work with Supabase's UUID type
const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

// Mock the @vercel/analytics/react module
jest.mock('@vercel/analytics/react', () => ({
  __esModule: true,
  default: () => <div data-testid="analytics" />,
}));

// Mock react-router-dom to silence v6 deprecation warnings
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({}),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

// Mock the AuthContext
export const mockAuth = {
  user: { id: TEST_USER_ID, email: 'test@example.com' },
  signIn: jest.fn(),
  signOut: jest.fn(),
  loading: false,
};

jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => mockAuth,
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

// Mock components
jest.mock('./components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('./components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

// Mock static assets
jest.mock('./assets/logo.png', () => 'logo.png');
jest.mock('./assets/logo-dark.png', () => 'logo-dark.png');
jest.mock('./assets/hammerandsickle.png', () => 'hammerandsickle.png');

// Custom render function that wraps components with necessary providers
export const renderWithProviders = (
  ui,
  {
    route = '/',
    ...renderOptions
  } = {}
) => {
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <MockMainLayout>
            {children}
          </MockMainLayout>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Re-export everything from testing-library/react
export * from '@testing-library/react';
// Override render method
export { renderWithProviders as render };

// Export mock components for direct use in tests
export { MockMainLayout, MockHeader, mockAnalytics };
