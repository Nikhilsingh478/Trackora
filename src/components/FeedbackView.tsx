
import { FeedbackForm } from './FeedbackForm';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function FeedbackView() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] relative overflow-hidden bg-background py-6 px-4">
      {/* Dynamic Backgrounds - refined positioning */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[60px] -z-10 pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[60px] -z-10 pointer-events-none mix-blend-screen animate-pulse delay-1000" />
      
      <div className="w-full mx-auto px-4 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8 text-center"
        >
          {/* Top Text Content */}
          <div className="space-y-4 py-32">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight max-w-2xl mx-auto">
              {/* We're building the ultimate discipline tool, and we need your voice. */}
              <br />
            </h1>
          </div>

          {/* Form Card */}
          <div className="w-full flex justify-center">
            <FeedbackForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
