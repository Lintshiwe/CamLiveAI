import { MockUser } from './types';

export const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Alex Chen', role: 'Admin', tenant: 'FreshFarms', tenantType: 'agriculture', active: true },
  { id: '2', name: 'Maria Santos', role: 'Operator', tenant: 'GreenHarvest', tenantType: 'agriculture', active: false },
  { id: '3', name: 'John Miller', role: 'Supervisor', tenant: 'WasteCo', tenantType: 'waste', active: false },
  { id: '4', name: 'Lisa Park', role: 'Analyst', tenant: 'LogiHub', tenantType: 'warehouse', active: false },
];

export const CURRENT_USER = MOCK_USERS[0];
