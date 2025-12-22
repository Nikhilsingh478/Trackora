import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Menu, X, Moon, Sun, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { useState } from 'react';

interface TopNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function TopNav({ currentView, onViewChange }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentMonth, setCurrentMonth } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const views = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'settings', label: 'Settings' },
  ];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <nav className="bg-card border-b border-border no-print sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl tracking-tight hidden sm:block bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                Trackora
              </h1>
            </div>
          </div>

          {/* Center: Month Navigator (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <span className="text-sm font-medium">{monthName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="ml-2">
              Today
            </Button>
          </div>

          {/* Right: Navigation Links (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-all relative ${
                  currentView === view.id
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {currentView === view.id && (
                  <motion.div
                    className="absolute inset-0 bg-accent/10 rounded-lg"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{view.label}</span>
              </button>
            ))}
            <div className="ml-2 pl-2 border-l border-border">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 90, scale: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: -90, scale: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-accent/5 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Month Navigator */}
        <div className="md:hidden flex items-center justify-center gap-2 pb-3">
          <Button variant="ghost" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-[160px] text-center">
            <span className="text-sm">{monthName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    onViewChange(view.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentView === view.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
                  }`}
                >
                  {view.label}
                </button>
              ))}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
