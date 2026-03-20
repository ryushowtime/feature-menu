'use client';

import { Onboarding } from '../Onboarding';
import { TaskWizard } from '../pages/TaskWizard';

export default function Page() {
  return (
    <>
      <TaskWizard />
      <Onboarding />
    </>
  );
}
