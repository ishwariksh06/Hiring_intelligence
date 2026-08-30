import { mockDelay, mockError } from './mockHelpers';
import * as q from '../db/queries';

export async function getCompanies() {
  return mockDelay(q.listCompanies());
}

export async function getCompanyById(id) {
  const company = q.getCompany(id);
  if (!company) return mockError('Company not found');
  return mockDelay(company);
}

export async function createCompany(payload) {
  if (!payload.name?.trim()) return mockError('Company name is required');
  return mockDelay(q.createCompany(payload), 600);
}
