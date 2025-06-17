
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, MessageSquare, X, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface MessageNotification {
  id: string;
  project_id: string;
  project_name: string;
  sender_type: 'client' | 'contractor';
  message_content: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationBellProps {
  onNotificationClick: (projectId: string, projectName: string) => void;
}

const NotificationBell = ({ onNotificationClick }: NotificationBellProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch system notifications (bills, etc.)
  const { data: systemNotifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  // Fetch message notifications
  const { data: messageNotifications = [] } = useQuery({
    queryKey: ['message-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile) return [];

      let query = supabase
        .from('messages')
        .select(`
          id,
          project_id,
          sender_type,
          message_content,
          created_at,
          projects!inner(project_name, contractor_id, client_email)
        `)
        .neq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Filter based on user role
      if (profile.role === 'contractor') {
        query = query.eq('projects.contractor_id', user.id);
      } else if (profile.role === 'client') {
        query = query.eq('projects.client_email', profile.email);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        project_id: msg.project_id,
        project_name: msg.projects.project_name,
        sender_type: msg.sender_type,
        message_content: msg.message_content,
        created_at: msg.created_at,
        is_read: false
      })) as MessageNotification[];
    },
    enabled: !!user && !!profile,
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user?.id || !profile) return;

    const messageChannel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Get project details for the notification
          const { data: project } = await supabase
            .from('projects')
            .select('project_name, contractor_id, client_email')
            .eq('id', payload.new.project_id)
            .single();

          if (project) {
            // Check if this notification is relevant for the current user
            const isRelevant = (profile.role === 'contractor' && project.contractor_id === user.id) ||
                              (profile.role === 'client' && project.client_email === profile.email);

            if (isRelevant) {
              // Show toast notification
              toast({
                title: 'New Message',
                description: `New message in ${project.project_name}`,
                action: (
                  <Button
                    size="sm"
                    onClick={() => {
                      onNotificationClick(payload.new.project_id, project.project_name);
                    }}
                  >
                    View
                  </Button>
                ),
              });

              // Invalidate notifications query to update the bell
              queryClient.invalidateQueries({ queryKey: ['message-notifications', user.id] });
            }
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for system notifications
    const notificationChannel = supabase
      .channel('system-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          
          // Show toast notification
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });

          // Invalidate notifications query to update the bell
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [user?.id, profile, toast, onNotificationClick, queryClient]);

  const totalUnreadCount = systemNotifications.filter(n => !n.is_read).length + messageNotifications.length;

  const handleMessageNotificationClick = (projectId: string, projectName: string) => {
    onNotificationClick(projectId, projectName);
    
    // Remove message notifications for this specific project
    queryClient.setQueryData(['message-notifications', user?.id], (oldData: MessageNotification[] = []) => {
      return oldData.filter(notification => notification.project_id !== projectId);
    });
    
    setIsOpen(false);
  };

  const handleSystemNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markNotificationAsReadMutation.mutate(notification.id);
    }
    
    // Handle different notification types
    if (notification.type === 'bill_created' && notification.data?.project_id) {
      // Could navigate to bills section or show bill details
      toast({
        title: 'Bill Details',
        description: `Bill ${notification.data.bill_number} for ${notification.data.amount}`,
      });
    }
    
    setIsOpen(false);
  };

  const clearAllNotifications = () => {
    queryClient.setQueryData(['message-notifications', user?.id], []);
    
    // Mark all system notifications as read
    systemNotifications.filter(n => !n.is_read).forEach(notification => {
      markNotificationAsReadMutation.mutate(notification.id);
    });
    
    setIsOpen(false);
  };

  // Show notification bell for both roles
  if (!profile) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {totalUnreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllNotifications}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-64">
          {totalUnreadCount === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* System notifications */}
              {systemNotifications.filter(n => !n.is_read).map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSystemNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {notification.type === 'bill_created' ? (
                      <DollarSign className="h-4 w-4 mt-1 text-green-600" />
                    ) : (
                      <FileText className="h-4 w-4 mt-1 text-blue-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Message notifications */}
              {messageNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleMessageNotificationClick(notification.project_id, notification.project_name)}
                >
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-4 w-4 mt-1 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {notification.project_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message_content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
