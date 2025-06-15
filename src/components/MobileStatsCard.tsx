
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  delay?: number;
}

const MobileStatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  delay = 0 
}: MobileStatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <div className="text-right">
              <div className="text-lg font-bold">{value}</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MobileStatsCard;
