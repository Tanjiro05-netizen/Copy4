// src/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login';
import App from './App';
import TheoryPage from './pages/TheoryPage';
import DigitalLibraryPage from './pages/DigitalLibraryPage';
import AnalysisPage from './pages/AnalysisPage';
import SubmitPage from './pages/SubmitPage';
import DirectoryPage from './pages/DirectoryPage';
import DataVisualizationPage from './pages/DataVisualizationPage';
import ArticleReaderPage from './pages/ArticleReaderPage';
import BookReaderPage from './pages/BookReaderPage';

const AppRouter = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Login route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <App />
                        </ProtectedRoute>
                    } />
                    <Route path="/theory" element={
                        <ProtectedRoute>
                            <TheoryPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/digital-library" element={
                        <ProtectedRoute>
                            <DigitalLibraryPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/directory" element={
                        <ProtectedRoute>
                            <DirectoryPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/analysis" element={<AnalysisPage />} />
                    <Route path="/submit" element={<SubmitPage />} />
                    <Route path="/visualizations" element={
                        <ProtectedRoute>
                            <DataVisualizationPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/article/:articleId" element={<ArticleReaderPage />} />
                    <Route path="/book/:bookId" element={
                        <ProtectedRoute>
                            <BookReaderPage />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default AppRouter;