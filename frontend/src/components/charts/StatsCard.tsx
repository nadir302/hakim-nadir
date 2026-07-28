import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isUp: boolean };
  color?: string;
  bg?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, color = 'text-primary', bg = 'bg-primary/10' }: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn('p-2.5 rounded-xl', bg)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trend.isUp ? 'text-green-600' : 'text-red-600')}>
              {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
