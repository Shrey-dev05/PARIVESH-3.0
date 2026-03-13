import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Application, MasterTemplate, Meeting, Document, Role } from '../types';
import { initialUsers, initialTemplates } from './mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  applications: Application[];
  templates: MasterTemplate[];
  meetings: Meeting[];
  documents: Document[];
  
  // Actions
  login: (email: string) => boolean;
  logout: () => void;
  createApplication: (app: Omit<Application, 'id' | 'status' | 'feeStatus'>) => void;
  updateApplicationStatus: (appId: string, status: Application['status'], edsComments?: string) => void;
  payFee: (appId: string, paymentRef: string) => void;
  generateGist: (appId: string) => void;
  updateMeeting: (meetingId: string, finalContent: string, isLocked: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: initialUsers,
      applications: [],
      templates: initialTemplates,
      meetings: [],
      documents: [],

      login: (email) => {
        const user = get().users.find(u => u.email === email);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      
      logout: () => set({ currentUser: null }),
      
      createApplication: (appData) => set((state) => ({
        applications: [...state.applications, {
          ...appData,
          id: `APP-${Date.now()}`,
          status: 'Draft',
          feeStatus: 'Pending',
        }]
      })),

      updateApplicationStatus: (appId, status, edsComments) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === appId ? { ...app, status, edsComments: edsComments || app.edsComments } : app
        )
      })),

      payFee: (appId, paymentRef) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === appId ? { 
            ...app, 
            feeStatus: 'Paid', 
            paymentReferenceId: paymentRef,
            status: 'Submitted'
          } : app
        )
      })),

      generateGist: (appId) => set((state) => {
        const app = state.applications.find(a => a.id === appId);
        if (!app) return state;

        const template = state.templates.find(t => t.category === app.category) || state.templates[0];
        
        // Simple string substitution
        let gistContent = template.templateContent;
        Object.entries(app.projectDetails).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          gistContent = gistContent.replace(regex, typeof value === 'string' ? value : JSON.stringify(value));
        });

        // Add to meetings list
        const newMeeting: Meeting = {
          id: `MTG-${Date.now()}`,
          applicationId: app.id,
          gistContent,
          isLocked: false
        };

        return {
          meetings: [...state.meetings, newMeeting],
          applications: state.applications.map(a => 
            a.id === appId ? { ...a, status: 'Referred' } : a
          )
        };
      }),

      updateMeeting: (meetingId, finalContent, isLocked) => set((state) => {
        const meetingIndex = state.meetings.findIndex(m => m.id === meetingId);
        if (meetingIndex === -1) return state;
        
        const newMeetings = [...state.meetings];
        newMeetings[meetingIndex] = {
          ...newMeetings[meetingIndex],
          finalMomContent: finalContent,
          isLocked
        };

        // Also update application status if locked
        let newApps = state.applications;
        if (isLocked) {
          const appId = newMeetings[meetingIndex].applicationId;
          newApps = state.applications.map(a => 
            a.id === appId ? { ...a, status: 'Finalized' } : a
          );
        }

        return { meetings: newMeetings, applications: newApps };
      }),

    }),
    {
      name: 'parivesh-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // using sessionStorage for the mock DB resetting on new tabs if needed
    }
  )
);
