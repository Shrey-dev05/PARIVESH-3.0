import { User, MasterTemplate } from '../types';

export const initialUsers: User[] = [
  {
    id: 'U-ADMIN',
    name: 'System Controller',
    email: 'admin@parivesh.nic.in',
    role: 'ADMIN',
  },
  {
    id: 'U-PP01',
    name: 'Ramesh Singh (PP)',
    email: 'pp@example.com',
    role: 'PP',
    organization: 'Green Energy Infra Ltd.'
  },
  {
    id: 'U-SCRUTINY-01',
    name: 'Scrutiny Officer',
    email: 'scrutiny@parivesh.nic.in',
    role: 'SCRUTINY',
  },
  {
    id: 'U-MOM-01',
    name: 'Amit Verma',
    email: 'mom@parivesh.gov.in',
    role: 'MOM',
  }
];

export const initialTemplates: MasterTemplate[] = [
  {
    id: 'TPL-A-MINING',
    category: 'A',
    sectorType: 'Mining',
    templateContent: `MINUTES OF THE MEETING (DRAFT GIST)
    
Date: \${new Date().toLocaleDateString()}
Category: A (Mining Sector)

1. Project Name: {{projectName}}
2. Location: {{location}}
3. Project Proponent: {{companyName}}
4. Proposed Area: {{area}} Hectares
5. Estimated Cost: Rs. {{cost}} Crores

The committee reviewed the application submitted by {{companyName}} for the project "{{projectName}}" located in {{location}}. The documentation provided indicates the requirement for standard EC protocols under Category A.`
  },
  {
    id: 'TPL-B1-INFRA',
    category: 'B1',
    sectorType: 'Infrastructure',
    templateContent: `MINUTES OF THE MEETING (DRAFT GIST)
    
Date: \${new Date().toLocaleDateString()}
Category: B1 (Infrastructure)

The proposal is for the construction of {{projectName}} at {{location}} by {{companyName}}. 
Total built-up area is {{area}} sqm with an estimated investment of Rs. {{cost}} Crores.
The committee assessed the environmental impacts and EIA reports submitted.`
  }
];
