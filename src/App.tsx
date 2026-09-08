import React, { Suspense, lazy, useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { TopBar } from './components/TopBar';
import { RoundNav } from './components/RoundNav';
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
const RoutineView = lazy(() =>
  import('./components/RoutineView').then((m) => ({ default: m.RoutineView }))
);
const ProfileView = lazy(() =>
  import('./components/ProfileView').then((m) => ({ default: m.ProfileView }))
);
const ExerciseDatabaseView = lazy(() =>
  import('./components/ExerciseDatabaseView').then((m) => ({ default: m.ExerciseDatabaseView }))
);

const AppContent: React.FC = () => {
  const { currentScreen, isAuthenticated, isHydrating } = useApp();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  if (isHydrating) {
    return (
      <div className="min-h-screen metal-surface flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (currentScreen === 'auth') {
      return (
        <ErrorBoundary>
          <TopBar onOpenNav={() => setIsNavOpen(true)} />
          <Suspense fallback={<PageLoader />}>
            <AuthView />
          </Suspense>
          <RoundNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
          <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
        </ErrorBoundary>
      );
    }
    // Default unauthenticated is Landing Page
    return (
      <ErrorBoundary>
        <TopBar onOpenNav={() => setIsNavOpen(true)} />
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
        </Suspense>
        <RoundNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'onboarding') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <OnboardingFlow />
        </Suspense>
        <RoundNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
      </ErrorBoundary>
    );
  }

  // Authenticated Main Layout (light, metallic)
  return (
    <div className="min-h-screen metal-surface text-[#1d1d1f] font-sans selection:bg-[#C0FF00] selection:text-black relative overflow-hidden">
      <div className="relative">
        <TopBar onOpenNav={() => setIsNavOpen(true)} />

        {/* Main Scrollable View Area */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {currentScreen === 'routine' && <RoutineView />}
              {currentScreen === 'exercises' && <ExerciseDatabaseView />}
              {currentScreen === 'profile' && (
                <ProfileView onOpenSafetyModal={() => setIsSafetyModalOpen(true)} />
              )}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <RoundNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
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