
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Home, Calendar, DollarSign, MessageSquare, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MilestoneTimeline from '@/components/MilestoneTimeline';
import PaymentOverviewCard from '@/components/PaymentOverviewCard';
import ProjectDocuments from '@/components/ProjectDocuments';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();
  const [expandedProjects, setExpandedProjects] = React.useState<Set<number>>(new Set());

  const toggleProjectExpansion = (index: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedProjects(newExpanded);
  };

  // Mock project data with IDs - in a real app, this would come from the database
  const mockProjects = [
    { id: '1', name: 'Kitchen Renovation', contractor: 'Elite Builders', status: 'In Progress', progress: 60, budget: '$35,000' },
    { id: '2', name: 'Bathroom Remodel', contractor: 'Modern Homes', status: 'Planning', progress: 15, budget: '$18,000' },
    { id: '3', name: 'Deck Installation', contractor: 'Outdoor Pro', status: 'Starting Soon', progress: 0, budget: '$12,000' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">TrustLayer</span>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Client
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
          <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your projects and communicate with contractors</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Home className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-600">2 in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$85,000</div>
              <p className="text-xs text-gray-600">Across all projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-gray-600">3 unread</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-gray-600">Days remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Overview Card */}
          <div className="lg:col-span-2">
            <PaymentOverviewCard />
          </div>

          {/* Project Timeline */}
          <div className="lg:col-span-2">
            <MilestoneTimeline />
          </div>

          {/* Active Projects with Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Your current construction projects and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProjects.map((project, index) => {
                  const isExpanded = expandedProjects.has(index);
                  return (
                    <div key={index} className="border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProjectExpansion(index)}
                            className="p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-gray-600">{project.contractor}</p>
                            <p className="text-sm text-blue-600 font-medium">{project.budget}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                          <div className="text-sm text-gray-600 mt-1">{project.progress}% Complete</div>
                        </div>
                      </div>
                      <Collapsible open={isExpanded} onOpenChange={() => toggleProjectExpansion(index)}>
                        <CollapsibleContent className="p-4 border-t">
                          <ProjectDocuments projectId={project.id} isContractor={false} />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your projects and communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full justify-start" variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Start New Project
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Contractor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Site Visit
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Invoices
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
