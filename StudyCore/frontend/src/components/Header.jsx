import React from 'react';
import { useAuth } from '../store/authStore';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <h1>Welcome, {user?.name || 'User'}</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </header>
  );
};

export default Header;
