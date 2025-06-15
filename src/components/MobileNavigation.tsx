
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Home, Calendar, DollarSign, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';

interface MobileNavigationProps {
  role: 'contractor' | 'client';
}

const MobileNavigation = ({ role }: MobileNavigationProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = role === 'contractor' 
    ? [
        { icon: Home, label: 'Projects', action: () => console.log('Navigate to projects') },
        { icon: Calendar, label: 'Schedule', action: () => console.log('Navigate to schedule') },
        { icon: DollarSign, label: 'Payments', action: () => console.log('Navigate to payments') },
        { icon: MessageSquare, label: 'Messages', action: () => console.log('Navigate to messages') },
        { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
      ]
    : [
        { icon: Home, label: 'Projects', action: () => console.log('Navigate to projects') },
        { icon: Calendar, label: 'Timeline', action: () => console.log('Navigate to timeline') },
        { icon: DollarSign, label: 'Invoices', action: () => console.log('Navigate to invoices') },
        { icon: MessageSquare, label: 'Messages', action: () => console.log('Navigate to messages') },
        { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
      ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-3">
              <UserAvatar 
                name={profile?.full_name} 
                email={profile?.email}
                showOnlineIndicator={true}
              />
              <div>
                <div className="font-semibold">{profile?.full_name || 'User'}</div>
                <div className="text-sm text-gray-500 capitalize">{role}</div>
              </div>
            </SheetTitle>
            <ThemeToggle />
          </div>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </nav>
          
          <div className="p-4 border-t">
            <Button variant="outline" onClick={signOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
