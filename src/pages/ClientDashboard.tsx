
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientProjectsList from '@/components/ClientProjectsList';
import ClientQuickActions from '@/components/ClientQuickActions';
import PaymentOverviewCard from '@/components/PaymentOverviewCard';
import ClientBills from '@/components/ClientBills';
import WelcomeMessage from '@/components/WelcomeMessage';
import MobileNavigation from '@/components/MobileNavigation';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import { useProjectChatModal } from '@/hooks/useProjectChatModal';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { openChat, ChatModal } = useProjectChatModal();

  const handleNotificationClick = (projectId: string, projectName: string) => {
    console.log('Opening chat for project:', projectName);
    openChat(projectId, projectName);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && <MobileNavigation role="client" />}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Client Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationBell onNotificationClick={handleNotificationClick} />
              {!isMobile && (
                <Button variant="outline" onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
              <ThemeToggle />
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <WelcomeMessage name={profile?.full_name} role="client" />
          
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ClientProjectsList />
              <PaymentOverviewCard />
              <ClientBills />
            </div>
            <div>
              <ClientQuickActions />
            </div>
          </div>
        </div>
      </main>

      {/* Chat Modal */}
      <ChatModal />
    </div>
  );
};

export default ClientDashboard;
