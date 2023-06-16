const mapping: Record<string, string> = {
  companies: 'company',
  'job-applications': 'job_application',
  payrolls: 'payroll',
  users: 'user',
  'vacation-requests': 'vacation_request',
};

export function convertRouteToEntityUtil(route: string) {
  return mapping[route] || route;
}
