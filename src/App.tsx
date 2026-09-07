import React, { Suspense, lazy, useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { SidebarNav } from './components/SidebarNav';
import { MobileNav } from './components/MobileNav';
import { SafetyModal } from './components/SafetyModal';
import { PageLoader } from './components/PageLoader';
import { ErrorBoundary } from './components/ErrorBoundary';

const LandingPage = lazy(() =>
  import('./components/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const AuthView = lazy(() => import('./components/AuthView').then((m) => ({ default: m.AuthView })));
const OnboardingFlow = lazy(() =>
  import('./components/OnboardingFlow').then((m) => ({ default: m.OnboardingFlow }))
);
const DashboardView = lazy(() =>
  import('./components/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const RoutineView = lazy(() =>
  import('./components/RoutineView').then((m) => ({ default: m.RoutineView }))
);
const ActiveWorkoutView = lazy(() =>
  import('./components/ActiveWorkoutView').then((m) => ({ default: m.ActiveWorkoutView }))
);
const CoachAIView = lazy(() =>
  import('./components/CoachAIView').then((m) => ({ default: m.CoachAIView }))
);
const ProgressView = lazy(() =>
  import('./components/ProgressView').then((m) => ({ default: m.ProgressView }))
);
const HistoryView = lazy(() =>
  import('./components/HistoryView').then((m) => ({ default: m.HistoryView }))
);
const ProfileView = lazy(() =>
  import('./components/ProfileView').then((m) => ({ default: m.ProfileView }))
);
const ExerciseDatabaseView = lazy(() =>
  import('./components/ExerciseDatabaseView').then((m) => ({ default: m.ExerciseDatabaseView }))
);

const AppContent: React.FC = () => {
  const { currentScreen, isAuthenticated } = useApp();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // If user is not authenticated: Landing or Auth
  if (!isAuthenticated) {
    if (currentScreen === 'auth') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AuthView />
            <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      );
    }
    // Default unauthenticated is Landing Page
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
          <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // If user is in onboarding flow: Full screen stepper
  if (currentScreen === 'onboarding') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <OnboardingFlow />
          <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Authenticated Main Layout
  return (
    <div className="flex h-screen bg-[#050505] text-[#F3F4F6] overflow-hidden font-sans selection:bg-[#C0FF00] selection:text-black">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex shrink-0">
        <SidebarNav onOpenSafetyModal={() => setIsSafetyModalOpen(true)} />
      </div>

      {/* Main Scrollable View Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 flex flex-col">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            {currentScreen === 'dashboard' && <DashboardView />}
            {currentScreen === 'routine' && <RoutineView />}
            {currentScreen === 'exercises' && <ExerciseDatabaseView />}
            {currentScreen === 'workout' && <ActiveWorkoutView />}
            {currentScreen === 'coach' && <CoachAIView />}
            {currentScreen === 'progress' && <ProgressView />}
            {currentScreen === 'history' && <HistoryView />}
            {currentScreen === 'profile' && (
              <ProfileView onOpenSafetyModal={() => setIsSafetyModalOpen(true)} />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Medical & Safety Consideration Modal */}
      <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
