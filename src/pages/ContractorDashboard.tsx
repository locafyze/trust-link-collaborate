
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import ProjectsList from '@/components/ProjectsList';
import PaymentRequestsList from '@/components/PaymentRequestsList';
import ContractorStats from '@/components/ContractorStats';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';

const ContractorDashboard = () => {
  const { profile, signOut } = useAuth();

  const handleProjectAdded = () => {
    // This will trigger a refetch of projects in the ProjectsList component
    console.log('Project added successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">TrustLayer</span>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Contractor
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {profile?.full_name}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contractor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your projects, client relationships, and payment requests</p>
        </div>

        {/* Stats Cards */}
        <ContractorStats />

        {/* Projects List - Full Width */}
        <div className="mb-8">
          <ProjectsList />
        </div>

        {/* Payment Requests - Full Width */}
        <div className="mb-8">
          <PaymentRequestsList />
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <RecentActivity />

          {/* Quick Actions */}
          <QuickActions onProjectAdded={handleProjectAdded} />
        </div>
      </main>
    </div>
  );
};

export default ContractorDashboard;
