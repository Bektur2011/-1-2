export const checkRole = (user, requiredRole) => {
  if (!user || !user.role) return false;

  const roleHierarchy = {
    student: 1,
    teacher: 2,
    creator: 3,
    admin: 4
  };

  const userRoleLevel = roleHierarchy[String(user.role).toLowerCase()] || 0;
  const requiredRoleLevel = roleHierarchy[String(requiredRole).toLowerCase()] || 0;

  return userRoleLevel >= requiredRoleLevel;
};

export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const isAdmin = (user) => {
  return user && String(user.role).toLowerCase() === 'admin';
};

export const isModerator = (user) => {
  return user && (String(user.role).toLowerCase() === 'creator' || String(user.role).toLowerCase() === 'admin');
};

export const isTeacher = (user) => {
  return user && (String(user.role).toLowerCase() === 'teacher' || String(user.role).toLowerCase() === 'creator' || String(user.role).toLowerCase() === 'admin');
};
