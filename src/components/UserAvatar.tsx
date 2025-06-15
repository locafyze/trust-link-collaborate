
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name?: string | null;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  showOnlineIndicator?: boolean;
}

const UserAvatar = ({ name, email, size = 'md', showOnlineIndicator = false }: UserAvatarProps) => {
  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src="" alt={name || email || ''} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
          {getInitials(name) || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      {showOnlineIndicator && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full"
        />
      )}
    </motion.div>
  );
};

export default UserAvatar;
