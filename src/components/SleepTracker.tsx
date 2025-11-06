import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { useState, useMemo } from 'react';
import { Moon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { safeNumber } from '../utils/safeNumber';

const sleepOptions = ['10hr', '9hr', '8hr', '7hr', '6hr', '5hr', '4hr'];

export function SleepTracker() {
  const { currentMonth, setSleepHours, getSleepHours } = useData();
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; hours: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Graph dimensions
  const width = Math.max(days.length * 48, 800);
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Parse sleep data and create graph points
  const sleepData = useMemo(() => {
    return days
      .map(day => {
        const hours = getSleepHours(day);
        if (!hours) return null;
        const parsed = parseFloat(hours);
        return !isNaN(parsed) ? { day, hours: parsed } : null;
      })
      .filter((d): d is { day: number; hours: number } => d !== null);
  }, [days, currentMonth, getSleepHours]);

  // Create SVG path
  const createPath = () => {
    if (sleepData.length === 0) return { path: '', points: [] };

    const points = sleepData.map(({ day, hours }) => {
      const x = padding.left + ((day - 1) / (daysInMonth - 1)) * graphWidth;
      const y = padding.top + graphHeight - ((hours - 3) / 8) * graphHeight;
      return { x, y, day, hours };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlPointX = (current.x + next.x) / 2;
      
      path += ` C ${controlPointX} ${current.y}, ${controlPointX} ${next.y}, ${next.x} ${next.y}`;
    }

    return { path, points };
  };

  const { path, points } = sleepData.length > 0 ? createPath() : { path: '', points: [] };

  const avgSleep = sleepData.length > 0 
    ? (sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length).toFixed(1)
    : '0';

  const handleSleepClick = (day: number, hours: string) => {
    setSleepHours(day, hours);
    toast.success(`Sleep set to ${hours} for day ${day}`);
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Moon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl">Sleep Tracker</h3>
              <p className="text-sm text-muted-foreground">Average: {avgSleep}h per night</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              {/* Sleep Graph */}
              {sleepData.length > 0 && (
                <div className="mb-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl p-4 overflow-x-auto">
                  <svg
                    width={width}
                    height={height}
                    className="min-w-full"
                    style={{ minWidth: `${width}px` }}
                  >
                    {/* Grid lines */}
                    {[4, 5, 6, 7, 8, 9, 10].map(h => {
                      const y = padding.top + graphHeight - ((h - 3) / 8) * graphHeight;
                      return (
                        <g key={h}>
                          <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            strokeDasharray="2,2"
                          />
                          <text
                            x={padding.left - 10}
                            y={y + 4}
                            fontSize="10"
                            fill="currentColor"
                            opacity={0.5}
                            textAnchor="end"
                          >
                            {h}h
                          </text>
                        </g>
                      );
                    })}

                    {/* Day markers */}
                    {days.filter((_, i) => i % 5 === 0).map(day => {
                      const x = padding.left + ((day - 1) / (daysInMonth - 1)) * graphWidth;
                      return (
                        <text
                          key={day}
                          x={x}
                          y={height - 10}
                          fontSize="10"
                          fill="currentColor"
                          opacity={0.5}
                          textAnchor="middle"
                        >
                          {day}
                        </text>
                      );
                    })}

                    {/* Area under the curve */}
                    <path
                      d={`${path} L ${points[points.length - 1]?.x || 0} ${height - padding.bottom} L ${points[0]?.x || 0} ${height - padding.bottom} Z`}
                      fill="url(#sleepAreaGradient)"
                      opacity={0.2}
                    />

                    {/* Line path */}
                    <path
                      d={path}
                      fill="none"
                      stroke="url(#sleepGradient)"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                      <linearGradient id="sleepAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>

                    {/* Data points */}
                    {points.map(({ x, y, day, hours }) => (
                      <circle
                        key={day}
                        cx={x}
                        cy={y}
                        r={5}
                        fill="#8b5cf6"
                        stroke="white"
                        strokeWidth={2}
                        onMouseEnter={() => setHoveredPoint({ day, hours: `${hours}hr` })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="cursor-pointer transition-all hover:r-7"
                        style={{
                          filter: hoveredPoint?.day === day ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))' : 'none'
                        }}
                      />
                    ))}

                    {/* Tooltip */}
                    {hoveredPoint && (
                      <g>
                        {(() => {
                          const point = points.find(p => p.day === hoveredPoint.day);
                          if (!point) return null;
                          
                          return (
                            <>
                              <rect
                                x={point.x - 35}
                                y={point.y - 45}
                                width={70}
                                height={35}
                                rx={6}
                                fill="rgba(0, 0, 0, 0.9)"
                              />
                              <text
                                x={point.x}
                                y={point.y - 28}
                                fontSize="11"
                                fill="white"
                                textAnchor="middle"
                              >
                                Day {point.day}
                              </text>
                              <text
                                x={point.x}
                                y={point.y - 15}
                                fontSize="13"
                                fill="#8b5cf6"
                                textAnchor="middle"
                                fontWeight="bold"
                              >
                                {point.hours}h
                              </text>
                            </>
                          );
                        })()}
                      </g>
                    )}
                  </svg>
                </div>
              )}

              {sleepData.length === 0 && (
                <div className="mb-6 p-8 text-center bg-muted/20 rounded-xl">
                  <Moon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No sleep data yet. Start tracking below!</p>
                </div>
              )}

              {/* Sleep Grid */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="flex border-b border-border bg-muted/30">
                    <div className="w-20 p-3 border-r border-border flex-shrink-0">
                      <span className="text-sm text-muted-foreground">Hours</span>
                    </div>
                    <div className="flex">
                      {days.map(day => {
                        const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
                        return (
                          <div key={day} className="w-12 p-2 text-center flex-shrink-0 border-r border-border">
                            <div className="text-xs text-muted-foreground">{dayNames[dayOfWeek]}</div>
                            <div className="text-sm mt-0.5">{day}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {sleepOptions.map((hours) => (
                    <div 
                      key={hours} 
                      className="flex border-b border-border hover:bg-muted/5 transition-colors"
                    >
                      <div className="w-20 p-3 border-r border-border flex items-center flex-shrink-0">
                        <span className="text-sm">{hours}</span>
                      </div>
                      <div className="flex">
                        {days.map(day => {
                          const selectedHours = getSleepHours(day);
                          const isSelected = selectedHours === hours;
                          
                          return (
                            <div
                              key={day}
                              className="w-12 p-2 flex items-center justify-center flex-shrink-0 border-r border-border"
                            >
                              <button
                                onClick={() => handleSleepClick(day, hours)}
                                className={`w-6 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:scale-110 ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg scale-110'
                                    : 'bg-muted/50 hover:bg-muted'
                                }`}
                                aria-pressed={isSelected}
                                aria-label={`${hours} sleep on day ${day}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
