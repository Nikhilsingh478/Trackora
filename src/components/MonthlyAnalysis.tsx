import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Award, AlertCircle, Moon, CheckCircle2 } from 'lucide-react';
import { safeNumber, safePercentage, safeAverage, isValidNumber } from '../utils/safeNumber';

export function MonthlyAnalysis() {
  try {
    const { protocols, currentMonth, getCellValue, getSleepHours } = useData();

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
            <h2 className="text-3xl">Monthly Analysis</h2>
            <p className="text-muted-foreground mt-1">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} overview
            </p>
          </div>
          <div className="text-center text-muted-foreground py-12">
            <p>No protocols added yet.</p>
            <p className="text-sm mt-2">Add some protocols from the Dashboard to see your monthly analysis.</p>
          </div>
        </div>
      );
    }

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Protocol completion stats - ensure all values are valid numbers
  const protocolStats = protocols.map(protocol => {
    const completed = days.filter(day => getCellValue(day, protocol.id)).length;
    const percentage = safePercentage(completed, daysInMonth);
    
    return {
      name: (protocol.label || 'Unnamed').substring(0, 30), // Truncate long names
      completed: safeNumber(completed, 0),
      percentage: safeNumber(percentage, 0),
      color: protocol.color || '#06b6d4'
    };
  }).filter(stat => 
    // Only include stats with valid numbers
    isValidNumber(stat.completed) && isValidNumber(stat.percentage)
  );

  // Overall completion
  const totalPossible = safeNumber(protocols.length * daysInMonth, 0);
  const totalCompleted = protocolStats.reduce((sum, p) => sum + safeNumber(p.completed, 0), 0);
  const overallCompletion = safePercentage(totalCompleted, totalPossible);

  // Sleep stats
  const sleepDays = days.filter(day => {
    const hours = getSleepHours(day);
    return hours !== undefined && hours !== null && hours !== '';
  });
  const sleepValues = sleepDays.map(day => {
    const hours = getSleepHours(day);
    return safeNumber(hours, 0);
  });
  const avgSleep = safeAverage(sleepValues).toFixed(1);

  // Best and worst protocol
  const sortedProtocols = [...protocolStats].sort((a, b) => b.completed - a.completed);
  const bestProtocol = sortedProtocols.length > 0 ? sortedProtocols[0] : { name: '-', percentage: 0, completed: 0, color: '#ccc' };
  const worstProtocol = sortedProtocols.length > 0 ? sortedProtocols[sortedProtocols.length - 1] : { name: '-', percentage: 0, completed: 0, color: '#ccc' };

  // Best day (most protocols completed)
  const dayCompletions = days.map(day => {
    const completed = protocols.filter(p => getCellValue(day, p.id)).length;
    return { day, completed };
  });
  const bestDay = dayCompletions.length > 0 
    ? dayCompletions.reduce((best, current) => 
        current.completed > best.completed ? current : best
      , { day: 1, completed: 0 })
    : { day: 1, completed: 0 };

  const stats = [
    {
      title: 'Overall Completion',
      value: `${safeNumber(overallCompletion, 0)}%`,
      icon: CheckCircle2,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Best Protocol',
      value: bestProtocol.name || '-',
      subtitle: `${safeNumber(bestProtocol.percentage, 0)}%`,
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Avg Sleep',
      value: `${avgSleep}h`,
      subtitle: `${sleepDays.length || 0} days tracked`,
      icon: Moon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Most Missed',
      value: worstProtocol.name || '-',
      subtitle: `${safeNumber(worstProtocol.percentage, 0)}%`,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  // Pie chart data for completion distribution - ensure valid numbers
  const completedValue = Math.max(0, safeNumber(totalCompleted, 0));
  const missedValue = Math.max(0, safeNumber(totalPossible - totalCompleted, 0));
  
  // Only create pie data if we have valid positive numbers
  const pieData = (completedValue > 0 || missedValue > 0) ? [
    { name: 'Completed', value: completedValue, color: '#06b6d4' },
    { name: 'Missed', value: missedValue, color: '#374151' }
  ].filter(item => isValidNumber(item.value) && item.value > 0) : [];

    return (
      <div className="p-4 lg:p-8">
        <div className="mb-6">
          <h2 className="text-3xl">Monthly Analysis</h2>
          <p className="text-muted-foreground mt-1">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} overview
          </p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl mt-2 truncate">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-sm text-muted-foreground mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Protocol Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {protocolStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={protocolStats} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis 
                      type="number" 
                      stroke="currentColor" 
                      opacity={0.5} 
                      domain={[0, 100]}
                      allowDataOverflow={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="currentColor" 
                      opacity={0.5} 
                      width={100} 
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
                    <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                      {protocolStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No protocols to display. Add some protocols to see completion rates.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Completion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => {
                          const num = safeNumber(value, 0);
                          return [num, ''];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {safeNumber(item.value, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No data to display. Add protocols and track your progress.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Day Highlight */}
      {bestDay.completed > 0 && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Best Day of the Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-yellow-500/10 rounded-2xl">
                <Award className="w-12 h-12 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl">Day {bestDay.day}</p>
                <p className="text-muted-foreground">
                  {bestDay.completed} out of {protocols.length} protocols completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    );
  } catch (error) {
    console.error('MonthlyAnalysis error:', error);
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center text-muted-foreground">
          <p>Unable to load monthly analysis.</p>
          <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
