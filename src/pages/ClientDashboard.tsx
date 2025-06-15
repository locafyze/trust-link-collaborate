
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Home, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import MilestoneTimeline from '@/components/MilestoneTimeline';
import PaymentOverviewCard from '@/components/PaymentOverviewCard';
import ClientProjectsList from '@/components/ClientProjectsList';
import ClientQuickActions from '@/components/ClientQuickActions';
import UserAvatar from '@/components/UserAvatar';
import ThemeToggle from '@/components/ThemeToggle';
import WelcomeMessage from '@/components/WelcomeMessage';
import AnimatedStatsCard from '@/components/AnimatedStatsCard';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">TrustLayer</span>
              <span className="ml-4 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                Client
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <WelcomeMessage name={profile?.full_name} role="client" />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects List - Takes 2 columns */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ClientProjectsList />
          </motion.div>

          {/* Quick Actions - Takes 1 column */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ClientQuickActions />
          </motion.div>

          {/* Payment Overview - Full width */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <PaymentOverviewCard />
          </motion.div>

          {/* Project Timeline - Full width */}
          <motion.div 
            className="lg:col-span-3"
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
