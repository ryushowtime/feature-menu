'use client';

import { ClientOnly } from '../components/ClientOnly';
import { Onboarding } from './Onboarding';
import { Dashboard } from './pages/Dashboard';

export default function Page() {
  return (
    <ClientOnly fallback={<div className="flex-1" />}>
      <Dashboard />
      <Onboarding />
    </ClientOnly>
  );
}
