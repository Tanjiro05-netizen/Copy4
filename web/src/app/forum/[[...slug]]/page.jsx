'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute.jsx';
import MainLayout from '@/src/components/MainLayout.jsx';
import ForumPage from '@/src/components/Forum/ForumPage.jsx';

export default function Page() {
  return <ProtectedRoute><MainLayout><ForumPage /></MainLayout></ProtectedRoute>;
}
