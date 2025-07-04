// src/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
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
import ArticleCollectionPage from './pages/ArticleCollectionPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TagManagementPage from './pages/admin/TagManagementPage.jsx';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';

const AppRouter = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        {/* Login route */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Common Protected routes (available to all authenticated users) */}
                        <Route path="/" element={<MainLayout><App /></MainLayout>} />
                        <Route path="/theory" element={<ProtectedRoute><MainLayout><TheoryPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/theory/:collectionType" element={<ProtectedRoute><MainLayout><ArticleCollectionPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/theory/article/:slug" element={<ProtectedRoute><MainLayout><ArticleReaderPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/digital-library" element={<ProtectedRoute><MainLayout><DigitalLibraryPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/analysis" element={<ProtectedRoute><MainLayout><AnalysisPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/submit" element={<ProtectedRoute><MainLayout><SubmitPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/article/:articleId" element={<ProtectedRoute><MainLayout><ArticleReaderPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/book/:bookId" element={<ProtectedRoute><MainLayout><BookReaderPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />

                        {/* Admin-only routes */}
                        <Route path="/directory" element={<AdminRoute><MainLayout><DirectoryPage /></MainLayout></AdminRoute>} />
                        <Route path="/study" element={<AdminRoute><MainLayout><StudyPage /></MainLayout></AdminRoute>} />
                        <Route path="/science-tech" element={<AdminRoute><MainLayout><ScienceTechPage /></MainLayout></AdminRoute>} />
                        <Route path="/visualizations" element={<AdminRoute><MainLayout><DataVisualizationPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/tags" element={<AdminRoute><MainLayout><TagManagementPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/submissions" element={<AdminRoute><MainLayout><AdminSubmissionsPage /></MainLayout></AdminRoute>} />
                        
                        {/* Coming Soon pages for non-admin users */}
                        <Route path="/coming-soon" element={<ProtectedRoute><MainLayout><ComingSoonPage /></MainLayout></ProtectedRoute>} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default AppRouter;