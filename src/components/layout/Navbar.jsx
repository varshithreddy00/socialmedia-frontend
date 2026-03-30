import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import {
  HiHome, HiOutlineHome,
  HiPlusCircle,
  HiUser,
  HiLogout,
  HiChevronDown,
} from 'react-icons/hi';
import './Navbar.css';

export default function Navbar({ onCreatePost }) {
  const { user, logout }        = useAuth();
  const location                = useLocation();
  const navigate                = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef                 = useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon">S</div>
          <span className="brand-name gradient-text">SocialApp</span>
        </Link>

        {/* Search Bar */}
        <SearchBar />

        {/* Nav Links */}
        <nav className="nav-center">
          <Link
            to="/"
            className={`nav-btn ${isHome ? 'nav-btn--active' : ''}`}
          >
            {isHome ? <HiHome size={22} /> : <HiOutlineHome size={22} />}
            <span>Home</span>
          </Link>

          <button className="nav-btn nav-btn--create" onClick={onCreatePost}>
            <HiPlusCircle size={22} />
            <span>Create</span>
          </button>

          <Link
            to={`/profile/${user?.username}`}
            className={`nav-btn ${location.pathname.startsWith('/profile') ? 'nav-btn--active' : ''}`}
          >
            <HiUser size={22} />
            <span>Profile</span>
          </Link>
        </nav>

        {/* User Dropdown */}
        <div className="nav-user" ref={menuRef}>
          <button
            className="user-trigger"
            onClick={() => setMenuOpen(p => !p)}
          >
            <Avatar user={user} size={32} />
            <span className="user-trigger-name">{user?.username}</span>
            <HiChevronDown
              size={14}
              className={`chevron ${menuOpen ? 'open' : ''}`}
            />
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <Avatar user={user} size={40} />
                <div>
                  <div className="dropdown-username">@{user?.username}</div>
                  <div className="dropdown-email">{user?.email}</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link
                to={`/profile/${user?.username}`}
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                <HiUser size={16} /> View Profile
              </Link>
              <button
                className="dropdown-item dropdown-item--danger"
                onClick={handleLogout}
              >
                <HiLogout size={16} /> Log Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}