import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Award, AlertCircle, Moon, CheckCircle2 } from 'lucide-react';

export function MonthlyAnalysis() {
  const { protocols, currentMonth, getCellValue, getSleepHours } = useData();

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Protocol completion stats
  const protocolStats = protocols.map(protocol => {
    const completed = days.filter(day => getCellValue(day, protocol.id)).length;
    const percentage = Math.round((completed / daysInMonth) * 100);
    
    return {
      name: protocol.label,
      completed,
      percentage,
      color: protocol.color
    };
  });

  // Overall completion
  const totalPossible = protocols.length * daysInMonth;
  const totalCompleted = protocolStats.reduce((sum, p) => sum + p.completed, 0);
  const overallCompletion = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // Sleep stats
  const sleepDays = days.filter(day => {
    const hours = getSleepHours(day);
    return hours !== undefined;
  });
  const avgSleep = sleepDays.length > 0
    ? (sleepDays.reduce((sum, day) => {
        const hours = getSleepHours(day);
        return sum + (hours ? parseInt(hours) : 0);
      }, 0) / sleepDays.length).toFixed(1)
    : '0';

  // Best and worst protocol
  const sortedProtocols = [...protocolStats].sort((a, b) => b.completed - a.completed);
  const bestProtocol = sortedProtocols[0] || { name: '-', percentage: 0 };
  const worstProtocol = sortedProtocols[sortedProtocols.length - 1] || { name: '-', percentage: 0 };

  // Best day (most protocols completed)
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
      value: bestProtocol.name,
      subtitle: `${bestProtocol.percentage}%`,
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
      value: worstProtocol.name,
      subtitle: `${worstProtocol.percentage}%`,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  // Pie chart data for completion distribution
  const pieData = [
    { name: 'Completed', value: totalCompleted, color: '#06b6d4' },
    { name: 'Missed', value: totalPossible - totalCompleted, color: '#374151' }
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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={protocolStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis type="number" stroke="currentColor" opacity={0.5} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" stroke="currentColor" opacity={0.5} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Completion']}
                  />
                  <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                    {protocolStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Completion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
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
}
