
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProjectChat from '@/components/ProjectChat';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectChatModalState {
  isOpen: boolean;
  projectId: string | null;
  projectName: string | null;
}

export const useProjectChatModal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState<ProjectChatModalState>({
    isOpen: false,
    projectId: null,
    projectName: null
  });

  const openChat = (projectId: string, projectName: string) => {
    setModalState({
      isOpen: true,
      projectId,
      projectName
    });

    // Clear notifications for this project when chat is opened
    if (user?.id) {
      queryClient.setQueryData(['notifications', user.id], (oldData: any[] = []) => {
        return oldData.filter(notification => notification.project_id !== projectId);
      });
    }
  };

  const closeChat = () => {
    setModalState({
      isOpen: false,
      projectId: null,
      projectName: null
    });
  };

  const ChatModal = () => (
    <Dialog open={modalState.isOpen} onOpenChange={closeChat}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Chat - {modalState.projectName}</DialogTitle>
        </DialogHeader>
        {modalState.projectId && modalState.projectName && (
          <ProjectChat
            projectId={modalState.projectId}
            projectName={modalState.projectName}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  return {
    openChat,
    closeChat,
    ChatModal
  };
};
