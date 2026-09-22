export const getCurrentUserEmail = (): string => {
  return localStorage.getItem('nextverse_user') || '';
};

export const getCurrentUserName = (): string => {
  const email = getCurrentUserEmail();
  if (!email) return 'User';
  // Extracts "Tejas" from "Tejas@gonextverse"
  return email.split('@')[0];
};
