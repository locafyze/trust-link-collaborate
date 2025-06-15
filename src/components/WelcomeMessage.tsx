
import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeMessageProps {
  name?: string | null;
  role: 'contractor' | 'client';
}

const WelcomeMessage = ({ name, role }: WelcomeMessageProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleMessage = (role: string) => {
    return role === 'contractor' 
      ? 'Ready to build something amazing today?'
      : 'Let\'s check on your projects!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-1"
    >
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {getGreeting()}, {name || 'there'}! 👋
      </h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-gray-600 dark:text-gray-300"
      >
        {getRoleMessage(role)}
      </motion.p>
    </motion.div>
  );
};

export default WelcomeMessage;
