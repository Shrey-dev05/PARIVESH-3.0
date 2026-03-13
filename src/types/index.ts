export type Role = 'ADMIN' | 'PP' | 'SCRUTINY' | 'MOM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization?: string;
}

export type ApplicationStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Under Scrutiny' 
  | 'EDS' 
  | 'Referred' 
  | 'MoM Generated' 
  | 'Finalized';

export type Category = 'A' | 'B1' | 'B2';
export type FeeStatus = 'Pending' | 'Paid';

export interface Application {
  id: string;
  ppId: string; // references User.id
  category: Category;
  sector: string;
  status: ApplicationStatus;
  projectDetails: Record<string, string>; // e.g., { projectName: '...', location: '...' }
  feeStatus: FeeStatus;
  paymentReferenceId?: string;
  edsComments?: string;
}

export interface Document {
  id: string;
  applicationId: string;
  documentType: string;
  fileUrl: string;
  uploadedBy: string;
}

export interface MasterTemplate {
  id: string;
  category: Category;
  sectorType: string;
  templateContent: string; // The text template with placeholders like {{projectName}}
}

export interface Meeting {
  id: string;
  applicationId: string;
  gistContent: string; // Pre-filled by system
  finalMomContent?: string; // Edited by MoM team
  isLocked: boolean;
}
