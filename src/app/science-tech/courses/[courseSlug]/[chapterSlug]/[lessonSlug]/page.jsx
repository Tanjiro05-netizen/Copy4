'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute.jsx';
import MainLayout from '@/src/components/MainLayout.jsx';
import LessonPage from '@/src/views/LessonPage.jsx';

export default function Page() {
  return <ProtectedRoute><MainLayout><LessonPage /></MainLayout></ProtectedRoute>;
}
