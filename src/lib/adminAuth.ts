// Admin Authentication Helper

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superuser';
  isAuthenticated: boolean;
}

export const getAdminUser = (): AdminUser | null => {
  try {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) return null;
    
    const admin = JSON.parse(authData);
    return admin.isAuthenticated ? admin : null;
  } catch {
    return null;
  }
};

export const isAdminAuthenticated = (): boolean => {
  return getAdminUser() !== null;
};

export const isSuperuser = (): boolean => {
  const admin = getAdminUser();
  return admin?.role === 'superuser';
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminAuth');
};
