import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardView } from './components/DashboardView';
import { RoutineView } from './components/RoutineView';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { CoachAIView } from './components/CoachAIView';
import { ProgressView } from './components/ProgressView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { ExerciseDatabaseView } from './components/ExerciseDatabaseView';
import { SidebarNav } from './components/SidebarNav';
import { MobileNav } from './components/MobileNav';
import { SafetyModal } from './components/SafetyModal';

const AppContent: React.FC = () => {
  const { currentScreen, isAuthenticated } = useApp();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // If user is not authenticated: Landing or Auth
  if (!isAuthenticated) {
    if (currentScreen === 'auth') {
      return (
        <>
          <AuthView />
          <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
        </>
      );
    }
    // Default unauthenticated is Landing Page
    return (
      <>
        <LandingPage />
        <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
      </>
    );
  }

  // If user is in onboarding flow: Full screen stepper
  if (currentScreen === 'onboarding') {
    return (
      <>
        <OnboardingFlow />
        <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} />
      </>
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
