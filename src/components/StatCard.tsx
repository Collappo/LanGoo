import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color = 'text-accent' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4"
    >
      <div className={`p-3 rounded-2xl bg-bg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-text-muted text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-text">{value}</p>
      </div>
    </motion.div>
  );
};
