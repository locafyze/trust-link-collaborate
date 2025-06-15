
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProjectsList from '@/components/ProjectsList';
import PaymentRequestsList from '@/components/PaymentRequestsList';
import ContractorStats from '@/components/ContractorStats';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';
import UserAvatar from '@/components/UserAvatar';
import ThemeToggle from '@/components/ThemeToggle';
import WelcomeMessage from '@/components/WelcomeMessage';
import MobileNavigation from '@/components/MobileNavigation';

const ContractorDashboard = () => {
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleProjectAdded = () => {
    console.log('Project added successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile-First Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <MobileNavigation role="contractor" />
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2" />
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    TrustLayer
                  </span>
                  <span className="text-xs sm:text-sm sm:ml-4 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                    Contractor
                  </span>
                </div>
              </motion.div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <UserAvatar 
                  name={profile?.full_name} 
                  email={profile?.email}
                  showOnlineIndicator={true}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {profile?.full_name || 'Welcome'}
                </span>
              </div>
              <ThemeToggle />
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-2">
              <ThemeToggle />
              <UserAvatar 
                name={profile?.full_name} 
                email={profile?.email}
                showOnlineIndicator={true}
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <WelcomeMessage name={profile?.full_name} role="contractor" />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <ContractorStats />
        </motion.div>

        {/* Projects List - Mobile Optimized */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ProjectsList />
        </motion.div>

        {/* Payment Requests */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <PaymentRequestsList />
        </motion.div>

        {/* Dashboard Content - Responsive Grid */}
        <motion.div 
          className={`grid gap-6 sm:gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          {/* Recent Activity */}
          <RecentActivity />

          {/* Quick Actions */}
          <QuickActions onProjectAdded={handleProjectAdded} />
        </motion.div>
      </main>
    </div>
  );
};

export default ContractorDashboard;
