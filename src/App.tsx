import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { WeeklyAnalysis } from './components/WeeklyAnalysis';
import { MonthlyAnalysis } from './components/MonthlyAnalysis';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import './utils/clearData'; // Load debug utilities

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    const views = {
      dashboard: Dashboard,
      weekly: WeeklyAnalysis,
      monthly: MonthlyAnalysis,
      settings: Settings,
    };

    const Component = views[currentView as keyof typeof views] || Dashboard;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <ThemeProvider>
      <DataProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-7xl bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col min-h-[90vh] max-h-[95vh]">
            <TopNav currentView={currentView} onViewChange={setCurrentView} />
            <main className="flex-1 overflow-auto">
              {renderView()}
            </main>
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}
