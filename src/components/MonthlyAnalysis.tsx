import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Award, AlertCircle, Moon, CheckCircle2, TrendingUp } from 'lucide-react';
import { safeNumber, safePercentage, safeAverage } from '../utils/safeNumber';

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

    // Protocol completion stats
    const protocolStats = protocols.map(protocol => {
      const completed = days.filter(day => getCellValue(day, protocol.id)).length;
      const percentage = safePercentage(completed, daysInMonth);
      
      return {
        id: protocol.id,
        name: (protocol.label || 'Unnamed').substring(0, 30),
        completed: safeNumber(completed, 0),
        percentage: Math.max(0, Math.min(100, safeNumber(percentage, 0))),
        color: protocol.color || '#06b6d4'
      };
    });

    // Overall completion
    const totalPossible = safeNumber(protocols.length * daysInMonth, 0);
    const totalCompleted = safeNumber(protocolStats.reduce((sum, p) => sum + p.completed, 0), 0);
    const overallCompletion = Math.max(0, Math.min(100, safePercentage(totalCompleted, totalPossible)));

    // Sleep stats
    const sleepDays = days.filter(day => {
      const hours = getSleepHours(day);
      return hours !== undefined && hours !== null && hours !== '';
    });
    const sleepValues = sleepDays.map(day => {
      const hours = getSleepHours(day);
      const num = parseFloat(hours as string) || 0;
      return Math.max(0, num);
    }).filter(v => v > 0);
    const avgSleep = sleepValues.length > 0 
      ? (sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1)
      : '0';

    // Best and worst protocol
    const sortedProtocols = [...protocolStats].sort((a, b) => b.percentage - a.percentage);
    const bestProtocol = sortedProtocols.length > 0 ? sortedProtocols[0] : null;
    const worstProtocol = sortedProtocols.length > 0 ? sortedProtocols[sortedProtocols.length - 1] : null;

    // Best day
    const dayCompletions = days.map(day => {
      const completed = protocols.filter(p => getCellValue(day, p.id)).length;
      return { day, completed };
    });
    const bestDay = dayCompletions.reduce((best, current) => 
      current.completed > best.completed ? current : best
    , { day: 1, completed: 0 });

    const stats = [
      {
        title: 'Overall Completion',
        value: `${overallCompletion}%`,
        icon: CheckCircle2,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10'
      },
      {
        title: 'Best Protocol',
        value: bestProtocol?.name || '-',
        subtitle: `${bestProtocol?.percentage || 0}%`,
        icon: Award,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
      },
      {
        title: 'Avg Sleep',
        value: `${avgSleep}h`,
        subtitle: `${sleepDays.length} days tracked`,
        icon: Moon,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
      },
      {
        title: 'Most Missed',
        value: worstProtocol?.name || '-',
        subtitle: `${worstProtocol?.percentage || 0}%`,
        icon: AlertCircle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
      }
    ];

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
                      <p className="text-2xl mt-2 truncate font-semibold">{stat.value}</p>
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

        {/* Protocol Completion Rates */}
        <Card className="hover:shadow-lg transition-shadow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Protocol Completion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {protocolStats.length > 0 ? (
                protocolStats.map((protocol) => (
                  <div key={protocol.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{protocol.name}</span>
                      <span className="text-sm font-semibold text-foreground">{protocol.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${protocol.percentage}%`,
                          backgroundColor: protocol.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {protocol.completed} of {daysInMonth} days completed
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No protocols to display.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Summary */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Completion Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Total Completion</span>
                    <span className="text-lg font-semibold">{totalCompleted}/{totalPossible}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${overallCompletion}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{overallCompletion}% of all tasks completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Day Highlight */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Best Day of the Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestDay.completed > 0 ? (
                <div className="space-y-2">
                  <p className="text-3xl font-bold">Day {bestDay.day}</p>
                  <p className="text-muted-foreground">
                    {bestDay.completed} out of {protocols.length} protocols completed
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      That's a productive day! Keep up the momentum.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  Complete some protocols to see your best day!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Protocol Rankings */}
        {protocolStats.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow mt-6">
            <CardHeader>
              <CardTitle>Protocol Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedProtocols.map((protocol, index) => (
                  <div key={protocol.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{protocol.name}</p>
                        <p className="text-xs text-muted-foreground">{protocol.completed} days completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{protocol.percentage}%</p>
                    </div>
                  </div>
                ))}
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
