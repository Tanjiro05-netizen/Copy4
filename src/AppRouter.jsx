// src/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/Login.jsx';
import App from './App.jsx';
import TheoryPage from './pages/TheoryPage.jsx';
import DigitalLibraryPage from './pages/DigitalLibraryPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import SubmitPage from './pages/SubmitPage.jsx';
import DirectoryPage from './pages/DirectoryPage.jsx';
import DataVisualizationPage from './pages/DataVisualizationPage.jsx';
import ArticleReaderPage from './pages/ArticleReaderPage.jsx';
import BookReaderPage from './pages/BookReaderPage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import ScienceTechPage from './pages/ScienceTechPage.jsx';
import MainLayout from './components/MainLayout.jsx';

const AppRouter = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                    {/* Login route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><MainLayout><App /></MainLayout></ProtectedRoute>} />
                    <Route path="/theory" element={<ProtectedRoute><MainLayout><TheoryPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/digital-library" element={<ProtectedRoute><MainLayout><DigitalLibraryPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/directory" element={<ProtectedRoute><MainLayout><DirectoryPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/analysis" element={<ProtectedRoute><MainLayout><AnalysisPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/study" element={<ProtectedRoute><MainLayout><StudyPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/science-tech" element={<ProtectedRoute><MainLayout><ScienceTechPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/submit" element={<ProtectedRoute><MainLayout><SubmitPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/visualizations" element={<ProtectedRoute><MainLayout><DataVisualizationPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/article/:articleId" element={<ProtectedRoute><MainLayout><ArticleReaderPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/book/:bookId" element={<ProtectedRoute><MainLayout><BookReaderPage /></MainLayout></ProtectedRoute>} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default AppRouter;