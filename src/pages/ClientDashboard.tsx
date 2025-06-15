
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Home, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MilestoneTimeline from '@/components/MilestoneTimeline';
import PaymentOverviewCard from '@/components/PaymentOverviewCard';
import ClientProjectsList from '@/components/ClientProjectsList';
import ClientQuickActions from '@/components/ClientQuickActions';
import UserAvatar from '@/components/UserAvatar';
import ThemeToggle from '@/components/ThemeToggle';
import WelcomeMessage from '@/components/WelcomeMessage';
import AnimatedStatsCard from '@/components/AnimatedStatsCard';
import MobileNavigation from '@/components/MobileNavigation';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();

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
              <MobileNavigation role="client" />
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
                  <span className="text-xs sm:text-sm sm:ml-4 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-medium">
                    Client
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
          <WelcomeMessage name={profile?.full_name} role="client" />
        </motion.div>

        {/* Stats Cards - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <AnimatedStatsCard
            title="Active Projects"
            value="3"
            subtitle="2 in progress"
            icon={Home}
            iconColor="text-blue-600"
            delay={0.1}
          />
          <AnimatedStatsCard
            title="Total Investment"
            value="$85,000"
            subtitle="Across all projects"
            icon={DollarSign}
            iconColor="text-green-600"
            delay={0.2}
          />
          <AnimatedStatsCard
            title="Messages"
            value="7"
            subtitle="3 unread"
            icon={MessageSquare}
            iconColor="text-yellow-600"
            delay={0.3}
          />
          <AnimatedStatsCard
            title="Next Milestone"
            value="5"
            subtitle="Days remaining"
            icon={Calendar}
            iconColor="text-red-600"
            delay={0.4}
          />
        </div>

        {/* Dashboard Content - Mobile-First Layout */}
        <div className={`grid gap-6 sm:gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Active Projects List */}
          <motion.div 
            className={isMobile ? 'order-1' : 'lg:col-span-2 order-1'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ClientProjectsList />
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className={`space-y-6 ${isMobile ? 'order-2' : 'order-2'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ClientQuickActions />
          </motion.div>

          {/* Payment Overview */}
          <motion.div 
            className={isMobile ? 'order-3' : 'lg:col-span-3 order-3'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <PaymentOverviewCard />
          </motion.div>

          {/* Project Timeline */}
          <motion.div 
            className={isMobile ? 'order-4' : 'lg:col-span-3 order-4'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <MilestoneTimeline />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
