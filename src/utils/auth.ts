export const getCurrentUserEmail = (): string => {
  return localStorage.getItem('nextverse_user') || '';
};

export const getCurrentUserName = (): string => {
  const email = getCurrentUserEmail();
  if (!email) return 'User';
  return email.split('@')[0];
};

export const getCurrentUserRole = (): string => {
  return localStorage.getItem('nextverse_user_role') || 'Employee';
};

export const isAdmin = (): boolean => {
  return getCurrentUserRole() === 'Admin';
};
