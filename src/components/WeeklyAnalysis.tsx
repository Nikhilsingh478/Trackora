import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Moon, Flame, Target } from 'lucide-react';

export function WeeklyAnalysis() {
  const { protocols, getCellValue, getSleepHours, currentMonth } = useData();

  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = 
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();

  // Get last 7 days
  const last7Days = isCurrentMonth 
    ? Array.from({ length: Math.min(7, currentDay) }, (_, i) => currentDay - i).reverse()
    : [];

  // Calculate completion rate per day
  const dailyCompletion = last7Days.map(day => {
    const completed = protocols.filter(p => getCellValue(day, p.id)).length;
    const total = protocols.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      day: day.toString(),
      completion: percentage,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  // Sleep data for last 7 days
  const sleepData = last7Days.map(day => {
    const hours = getSleepHours(day);
    return {
      day: day.toString(),
      hours: hours ? parseInt(hours) : 0,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  // Calculate metrics
  const avgCompletion = dailyCompletion.length > 0
    ? Math.round(dailyCompletion.reduce((sum, d) => sum + d.completion, 0) / dailyCompletion.length)
    : 0;

  const avgSleep = sleepData.length > 0
    ? (sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.filter(d => d.hours > 0).length || 0).toFixed(1)
    : '0';

  const streak = (() => {
    let count = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      const day = last7Days[i];
      const completed = protocols.filter(p => getCellValue(day, p.id)).length;
      if (completed > 0) count++;
      else break;
    }
    return count;
  })();

  const bestDay = dailyCompletion.reduce((best, current) => 
    current.completion > best.completion ? current : best
  , { day: '-', completion: 0, date: '' });

  const stats = [
    {
      title: 'Avg Completion',
      value: `${avgCompletion}%`,
      icon: Target,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Current Streak',
      value: `${streak} days`,
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} />
                  <YAxis stroke="currentColor" opacity={0.5} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Completion']}
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
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Sleep Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} />
                  <YAxis stroke="currentColor" opacity={0.5} domain={[0, 12]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}h`, 'Sleep']}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="url(#sleepGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <defs>
                    <linearGradient id="sleepGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
