import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Moon, Flame, Target } from 'lucide-react';
import { safeNumber, safePercentage, safeAverage, isValidNumber } from '../utils/safeNumber';

export function WeeklyAnalysis() {
  try {
    const { protocols, getCellValue, getSleepHours, currentMonth } = useData();

    // Defensive checks
    if (!currentMonth || !(currentMonth instanceof Date) || isNaN(currentMonth.getTime())) {
      return (
        <div className="p-4 lg:p-8">
          <div className="text-center text-muted-foreground">
            Invalid date. Please try refreshing the page.
          </div>
        </div>
      );
    }

    if (!protocols || !Array.isArray(protocols)) {
      return (
        <div className="p-4 lg:p-8">
          <div className="text-center text-muted-foreground">
            Loading protocols...
          </div>
        </div>
      );
    }

    if (!getCellValue || typeof getCellValue !== 'function') {
      return (
        <div className="p-4 lg:p-8">
          <div className="text-center text-muted-foreground">
            Data context not ready. Please try refreshing the page.
          </div>
        </div>
      );
    }

    // Early return if no protocols
    if (protocols.length === 0) {
      return (
        <div className="p-4 lg:p-8">
          <div className="mb-6">
            <h2 className="text-3xl">Weekly Analysis</h2>
            <p className="text-muted-foreground mt-1">Last 7 days overview</p>
          </div>
          <div className="text-center text-muted-foreground py-12">
            <p>No protocols added yet.</p>
            <p className="text-sm mt-2">Add some protocols from the Dashboard to see your weekly analysis.</p>
          </div>
        </div>
      );
    }

  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = 
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();

  // Get current week (Monday -> Sunday)
  const getWeekDates = () => {
    const d = new Date(today);
    const day = d.getDay(); // 0 is Sunday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(new Date(d).setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      days.push(nextDate);
    }
    return days;
  };

  const weekDates = getWeekDates();

  // Calculate completion rate per day (Mon-Sun)
  const dailyCompletion = weekDates.map(date => {
    const isInMonth = date.getMonth() === currentMonth.getMonth() && 
                      date.getFullYear() === currentMonth.getFullYear();
    
    let percentage = 0;
    if (isInMonth) {
       const day = date.getDate();
       const completed = protocols.filter(p => getCellValue(day, p.id)).length;
       const total = protocols.length;
       percentage = safePercentage(completed, total);
    }

    return {
      day: date.getDate().toString(),
      completion: safeNumber(percentage, 0),
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      originalDate: date
    };
  });

  // Sleep data (Mon-Sun)
  const sleepData = weekDates.map(date => {
    const isInMonth = date.getMonth() === currentMonth.getMonth() && 
                      date.getFullYear() === currentMonth.getFullYear();
    
    let hours = 0;
    if (isInMonth) {
        hours = safeNumber(getSleepHours(date.getDate()), 0);
    }

    return {
      day: date.getDate().toString(),
      hours: hours,
      date: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  // Calculate metrics
  // Filter out zero values correctly for averages if we want "average of active days"
  // But strict Mon-Sun might have future days with 0. 
  // Should average include 0? Usually "Average Completion" implies over the period generated.
  // Previous logic used `last7Days` which excluded future days.
  // I should probably filter out future dates for average calculation to be fair.
  
  const pastDates = dailyCompletion.filter(d => d.originalDate <= today);
  const avgCompletion = safeNumber(
    Math.round(safeAverage(pastDates.map(d => d.completion))),
    0
  );

  const sleepDaysWithData = sleepData.filter(d => d.hours > 0);
  const avgSleep = safeAverage(sleepDaysWithData.map(d => d.hours)).toFixed(1);

  const streak = (() => {
    let count = 0;
    // Check backwards from today for up to 30 days within the current month
    const checkDate = new Date(today);
    
    for(let i=0; i<30; i++) {
        const isInMonth = checkDate.getMonth() === currentMonth.getMonth() && 
                          checkDate.getFullYear() === currentMonth.getFullYear();
        if (!isInMonth) break;
        
        const day = checkDate.getDate();
        const completed = protocols.filter(p => getCellValue(day, p.id)).length;
        
        if (completed > 0) {
            count++;
        } else if (i > 0) {
            // Should break if we miss a day (except possibly today if not yet done)
            // If i==0 (today) and incomplete, we don't increment, but we check yesterday.
            // If i>0 (yesterday or before) and incomplete, streak ends.
            break;
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return count;
  })();

  const bestDay = dailyCompletion.length > 0
    ? dailyCompletion.reduce((best, current) => 
        current.completion > best.completion ? current : best
      , { day: '-', completion: 0, date: '-' })
    : { day: '-', completion: 0, date: '-' };

  const stats = [
    {
      title: 'Avg Completion',
      value: `${safeNumber(avgCompletion, 0)}%`,
      icon: Target,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Current Streak',
      value: `${safeNumber(streak, 0)} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Avg Sleep',
      value: `${avgSleep}h`,
      icon: Moon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Best Day',
      value: bestDay.date || '-',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-3xl">Weekly Analysis</h2>
        <p className="text-muted-foreground mt-1">Last 7 days overview</p>
      </div>

      {!isCurrentMonth && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-600 dark:text-yellow-400">
            Weekly analysis is only available for the current month
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Daily Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {dailyCompletion.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyCompletion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="date" stroke="currentColor" opacity={0.5} />
                    <YAxis 
                      stroke="currentColor" 
                      opacity={0.5} 
                      domain={[0, 100]}
                      allowDataOverflow={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => {
                        const num = safeNumber(value, 0);
                        return [`${num}%`, 'Completion'];
                      }}
                    />
                    <Bar dataKey="completion" fill="url(#completionGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No data available for the current week
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Sleep Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {sleepData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="date" stroke="currentColor" opacity={0.5} />
                    <YAxis 
                      stroke="currentColor" 
                      opacity={0.5} 
                      domain={[0, 12]}
                      allowDataOverflow={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => {
                        const num = safeNumber(value, 0);
                        return [`${num}h`, 'Sleep'];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="url(#sleepGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 5 }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={false}
                    />
                    <defs>
                      <linearGradient id="sleepGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No sleep data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    );
  } catch (error) {
    console.error('WeeklyAnalysis error:', error);
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center text-muted-foreground">
          <p>Unable to load weekly analysis.</p>
          <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
