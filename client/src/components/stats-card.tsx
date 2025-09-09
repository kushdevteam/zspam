import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "orange" | "green" | "purple";
  subtitle?: string;
}

const colorClasses = {
  blue: "bg-blue-500/20 text-blue-400",
  orange: "bg-orange-500/20 text-orange-400", 
  green: "bg-green-500/20 text-green-400",
  purple: "bg-purple-500/20 text-purple-400",
};

export default function StatsCard({ title, value, icon: Icon, color, subtitle }: StatsCardProps) {
  return (
    <Card data-testid={`stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color === 'orange' ? 'text-orange-400' : color === 'green' ? 'text-green-400' : color === 'purple' ? 'text-purple-400' : 'text-foreground'}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-sm mt-1 ${color === 'green' ? 'text-green-400' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
