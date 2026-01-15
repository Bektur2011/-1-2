export const checkRole = (user, requiredRole) => {
  if (!user || !user.role) return false;

  const roleHierarchy = {
    student: 1,
    teacher: 2,
    moderator: 3,
    admin: 4
  };

  const userRoleLevel = roleHierarchy[user.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
};

export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

export const isModerator = (user) => {
  return user && (user.role === 'moderator' || user.role === 'admin');
};

export const isTeacher = (user) => {
  return user && (user.role === 'teacher' || user.role === 'moderator' || user.role === 'admin');
};
