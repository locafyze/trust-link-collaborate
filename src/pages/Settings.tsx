
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Building2, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/components/UserAvatar';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    companyName: '',
    bio: ''
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: false,
    projectNotifications: true,
    paymentReminders: true,
    marketingEmails: false
  });

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (profile?.role === 'contractor') {
      navigate('/contractor-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-6"
        >
          <Button variant="ghost" onClick={goBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <UserAvatar 
                    name={profileData.fullName} 
                    email={profileData.email} 
                    size="lg" 
                  />
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>

                {/* Company Name (Contractors only) */}
                {profile?.role === 'contractor' && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter your company name"
                    />
                  </div>
                )}

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    {profile?.role === 'contractor' ? 'Company Description' : 'About'}
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={profile?.role === 'contractor' 
                      ? "Describe your company and services..." 
                      : "Tell us about yourself..."}
                    rows={3}
                  />
                </div>

                <Button onClick={handleProfileSave} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive updates and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">Email Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailUpdates">Project Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about project progress and milestones</p>
                    </div>
                    <Switch
                      id="emailUpdates"
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="projectNotifications">New Messages</Label>
                      <p className="text-sm text-gray-500">Receive notifications for new project messages</p>
                    </div>
                    <Switch
                      id="projectNotifications"
                      checked={notifications.projectNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, projectNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="paymentReminders">Payment Reminders</Label>
                      <p className="text-sm text-gray-500">
                        {profile?.role === 'contractor' 
                          ? 'Get reminded about payment requests and invoices'
                          : 'Receive reminders about pending payments'}
                      </p>
                    </div>
                    <Switch
                      id="paymentReminders"
                      checked={notifications.paymentReminders}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, paymentReminders: checked }))}
                    />
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">SMS Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsAlerts">Urgent Alerts</Label>
                      <p className="text-sm text-gray-500">Receive SMS for urgent project updates</p>
                    </div>
                    <Switch
                      id="smsAlerts"
                      checked={notifications.smsAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsAlerts: checked }))}
                    />
                  </div>
                </div>

                {/* Marketing */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">Marketing</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Promotional Emails</Label>
                      <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketingEmails: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleNotificationSave} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Settings for Contractors */}
        {profile?.role === 'contractor' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Business Settings
                </CardTitle>
                <CardDescription>
                  Manage your business-specific preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="Enter license number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      placeholder="Enter insurance provider"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceAreas">Service Areas</Label>
                  <Textarea
                    id="serviceAreas"
                    placeholder="List the areas you provide services in..."
                    rows={2}
                  />
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Business Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
