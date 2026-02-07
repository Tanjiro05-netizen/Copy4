// src/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Root from './Root.jsx';
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
import CoursePage from './pages/CoursePage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import TextbookReaderPage from './pages/TextbookReaderPage.jsx';
import CertificateVerifyPage from './pages/CertificateVerifyPage.jsx';
import ChapterTestPage from './pages/ChapterTestPage.jsx';
import PoliticsPage from './pages/PoliticsPage.jsx';
import MainLayout from './components/MainLayout.jsx';
import ArticleCollectionPage from './pages/ArticleCollectionPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TagManagementPage from './pages/admin/TagManagementPage.jsx';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';
import PendingAccessPage from './pages/PendingAccessPage.jsx';
import ForumPage from './components/Forum/ForumPage.jsx';
import KnowledgePage from './pages/KnowledgePage.jsx';
import KnowledgeAskPage from './pages/KnowledgeAskPage.jsx';
import KnowledgeQuestionPage from './pages/KnowledgeQuestionPage.jsx';
import KnowledgeStudyPage from './pages/KnowledgeStudyPage.jsx';
import KnowledgeModerationPage from './pages/admin/KnowledgeModerationPage.jsx';
import AnalysisUploadPage from './pages/admin/AnalysisUploadPage.jsx';
import LibraryUploadPage from './pages/admin/LibraryUploadPage.jsx';
import QuizAdminPage from './pages/admin/QuizAdminPage.jsx';
import ScenarioAdminPage from './pages/admin/ScenarioAdminPage.jsx';
import STEMAdminPage from './pages/admin/STEMAdminPage.jsx';
import WorldSimPage from './pages/WorldSimPage.jsx';
import { TextBrowser } from './components/Analysis/AnalysisBrowser';
import { AnalysisReader } from './components/Analysis/AnalysisReader';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

const AppRouter = () => {
    return (
        <ErrorBoundary>
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        {/* Login route */}
                        <Route path="/login" element={<LandingPage />} />

                        {/* Common Protected routes (available to all authenticated users) */}
                        <Route path="/" element={<Root />} />
                        <Route path="/home" element={<MainLayout><App /></MainLayout>} />
                        <Route path="/theory" element={<ProtectedRoute><MainLayout><TheoryPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/theory/:collectionType" element={<ProtectedRoute><MainLayout><ArticleCollectionPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/theory/article/:slug" element={<ProtectedRoute><MainLayout><ArticleReaderPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/digital-library" element={<MainLayout><DigitalLibraryPage /></MainLayout>} />
                        <Route path="/analysis" element={<ProtectedRoute><MainLayout><TextBrowser /></MainLayout></ProtectedRoute>} />
                        <Route path="/analysis/text/:slug" element={<ProtectedRoute><MainLayout><AnalysisReader /></MainLayout></ProtectedRoute>} />
                        <Route path="/analysis/legacy" element={<ProtectedRoute><MainLayout><AnalysisPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/submit" element={<ProtectedRoute><MainLayout><SubmitPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/article/:articleId" element={<ProtectedRoute><MainLayout><ArticleReaderPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/book/:bookId" element={<ProtectedRoute><MainLayout><BookReaderPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />

                        {/* Previously Admin-only routes, now opened up */}
                        <Route path="/directory" element={<ProtectedRoute><MainLayout><DirectoryPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/study" element={<ProtectedRoute><MainLayout><StudyPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/science-tech" element={<ProtectedRoute><MainLayout><ScienceTechPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/science-tech/courses/:courseSlug" element={<ProtectedRoute><MainLayout><CoursePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/science-tech/courses/:courseSlug/:chapterSlug/test" element={<ProtectedRoute><ChapterTestPage /></ProtectedRoute>} />
                        <Route path="/science-tech/courses/:courseSlug/:chapterSlug/:lessonSlug" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
                        <Route path="/science-tech/textbooks/:id" element={<ProtectedRoute><MainLayout><TextbookReaderPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/verify/:certificateNumber" element={<MainLayout><CertificateVerifyPage /></MainLayout>} />
                        <Route path="/politics" element={<ProtectedRoute><MainLayout><PoliticsPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/visualizations" element={<ProtectedRoute><MainLayout><DataVisualizationPage /></MainLayout></ProtectedRoute>} />
                        
                        {/* Admin-only routes */}
                        <Route path="/admin/tags" element={<AdminRoute><MainLayout><TagManagementPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/submissions" element={<AdminRoute><MainLayout><AdminSubmissionsPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/knowledge" element={<AdminRoute><MainLayout><KnowledgeModerationPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/analysis/upload" element={<AdminRoute><MainLayout><AnalysisUploadPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/library/upload" element={<AdminRoute><MainLayout><LibraryUploadPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/quizzes" element={<AdminRoute><MainLayout><QuizAdminPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/scenarios" element={<AdminRoute><MainLayout><ScenarioAdminPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/stem" element={<AdminRoute><MainLayout><STEMAdminPage /></MainLayout></AdminRoute>} />
                        <Route path="/admin/world-sim" element={<AdminRoute><WorldSimPage /></AdminRoute>} />
                        
                        {/* Forum routes */}
                        <Route path="/forum" element={<MainLayout><ForumPage /></MainLayout>} />
                        <Route path="/forum/*" element={<MainLayout><ForumPage /></MainLayout>} />
                        
                        {/* Knowledge Q&A routes */}
                        <Route path="/knowledge" element={<ProtectedRoute><MainLayout><KnowledgePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/knowledge/ask" element={<ProtectedRoute><MainLayout><KnowledgeAskPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/knowledge/question/:id" element={<ProtectedRoute><MainLayout><KnowledgeQuestionPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/knowledge/study" element={<ProtectedRoute><MainLayout><KnowledgeStudyPage /></MainLayout></ProtectedRoute>} />
                        
                        {/* Pending access page for users without invite code */}
                        <Route path="/pending-access" element={<MainLayout><PendingAccessPage /></MainLayout>} />

                        {/* Coming Soon page (accessible to everyone including guests) */}
                        <Route path="/coming-soon" element={<MainLayout><ComingSoonPage /></MainLayout>} />

                        {/* 404 Catch-all */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
        </ErrorBoundary>
    );
};

export default AppRouter;