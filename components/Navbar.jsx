// frontend/src/components/Navbar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  LogOut, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

/**
 * Navbar Component
 * Provides main navigation and user profile status.
 * Uses NavLink for active routing states.
 */
const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top py-3">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <div className="bg-white text-primary rounded p-1">
            <ShieldCheck size={24} />
          </div>
          <span className="ls-tight">Portal</span>
        </NavLink>

        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#attendanceNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="attendanceNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 rounded-pill ${isActive ? 'active bg-white bg-opacity-10 fw-bold' : ''}`} 
                to="/"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 rounded-pill ${isActive ? 'active bg-white bg-opacity-10 fw-bold' : ''}`} 
                to="/attendance"
              >
                <ClipboardCheck size={18} />
                Attendance
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 rounded-pill ${isActive ? 'active bg-white bg-opacity-10 fw-bold' : ''}`} 
                to="/students"
              >
                <Users size={18} />
                Students
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-xl-flex flex-column align-items-end me-2">
              <span className="text-white fw-bold small leading-tight">{user.full_name}</span>
              <span className="text-white-50 x-small text-uppercase tracking-wider">{user.role}</span>
            </div>
            
            <div className="dropdown">
              <button 
                className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: '40px', height: '40px' }}
              >
                <UserIcon size={20} className="text-primary" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                <li className="px-3 py-2 border-bottom d-xl-none">
                  <div className="fw-bold small">{user.full_name}</div>
                  <div className="text-muted x-small">{user.role}</div>
                </li>
                <li>
                  <button className="dropdown-item py-2 d-flex align-items-center gap-2" onClick={handleLogout}>
                    <LogOut size={16} className="text-danger" />
                    <span className="text-danger fw-medium">Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;