'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute.jsx';
import SubmitPage from '@/src/views/SubmitPage.jsx';

export default function Page() {
  return <ProtectedRoute><SubmitPage /></ProtectedRoute>;
}
