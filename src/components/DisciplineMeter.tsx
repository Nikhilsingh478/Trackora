
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface DisciplineMeterProps {
  score: number;
}

export function DisciplineMeter({ score }: DisciplineMeterProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const getStatus = (s: number) => {
    if (s >= 90) return { color: '#10b981', label: 'Elite' }; // Emerald
    if (s >= 75) return { color: '#3b82f6', label: 'Pro' };   // Blue
    if (s >= 50) return { color: '#f59e0b', label: 'Consistent' }; // Amber
    return { color: '#ef4444', label: 'Beginner' }; // Red
  };

  const status = getStatus(score);

  return (
    <div className="mb-8 w-full">
      <div className="flex items-end justify-between mb-3 px-1">
        <div className="flex flex-col gap-1">
           <h3 className="text-lg font-bold tracking-tight text-foreground">Discipline Score</h3>
           <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{status.label} Tier</p>
        </div>
        <div className="flex items-baseline gap-1">
           <span className="text-3xl font-black tabular-nums leading-none" style={{ color: status.color }}>
             {Math.round(displayScore)}
           </span>
           <span className="text-sm font-bold text-muted-foreground">%</span>
        </div>
      </div>

      {/* Broad Loader Bar */}
      <div className="h-6 w-full bg-muted/40 rounded-full overflow-hidden p-1 shadow-inner border border-white/5">
        <motion.div 
          className="h-full rounded-full shadow-sm relative overflow-hidden"
          style={{ backgroundColor: status.color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "circOut" }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full opacity-50" />
        </motion.div>
      </div>
    </div>
  );
}
