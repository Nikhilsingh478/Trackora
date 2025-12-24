

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { MessageSquarePlus, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';

interface FeedbackPromptProps {
  onNavigateToFeedback: () => void;
}

export function FeedbackPrompt({ onNavigateToFeedback }: FeedbackPromptProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already been prompted
    const hasPrompted = localStorage.getItem('trackora_feedback_prompted');
    if (hasPrompted) return;

    // Trigger popup after 30 seconds of usage
    const timer = setTimeout(() => {
      setOpen(true);
      // Mark as shown so it only appears once
      localStorage.setItem('trackora_feedback_prompted', 'true');
    }, 30000); 

    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = () => {
    setOpen(false);
    onNavigateToFeedback();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md w-[90%] md:w-full border-white/10 bg-background backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-0 gap-0 overflow-hidden rounded-2xl ring-1 ring-white/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] duration-200 z-[99999]">
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-80" />
        
        {/* Subtle Glow */}
        <div className="absolute top-0 inset-x-0 h-[100px] bg-cyan-500/10 blur-[50px] pointer-events-none" />

        <div className="absolute right-4 top-4 z-10">
           <button 
             onClick={() => setOpen(false)}
             className="text-muted-foreground/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
           >
             <X className="w-4 h-4" />
           </button>
        </div>

        <div className="p-8 pb-4 flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 shadow-[0_0_20px_-5px_rgba(6,182,212,0.2)] flex items-center justify-center mb-6 group transition-all duration-500 hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)]">
               <MessageSquarePlus className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            </div>
            
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
                Review Your Journey
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-[15px] leading-relaxed max-w-[90%] mx-auto">
                Trackora is shaped by disciplined users like you. Share your insights to help us build a better tool.
              </DialogDescription>
            </DialogHeader>
        </div>
        
        <DialogFooter className="p-8 pt-4 flex flex-col sm:flex-row gap-3 w-full relative z-10">
            <Button 
              onClick={() => setOpen(false)}
              variant="ghost" 
              className="text-muted-foreground hover:text-white hover:bg-white/5 w-full sm:flex-1 h-11 rounded-xl text-sm font-medium transition-all"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleNavigate}
              className="bg-cyan-500 hover:bg-cyan-400 text-black border-0 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.5)] w-full sm:flex-1 h-11 rounded-xl font-semibold tracking-wide transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-[1px]"
            >
              Give Feedback
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

