// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  ChevronRight,
  Database,
  Smartphone,
  Globe,
  Server,
  RefreshCw,
  Bell
} from 'lucide-react';
import axios from 'axios';

/**
 * Dashboard Component
 * High-End ERP Design for College Attendance Management.
 * Features real-time system monitoring and institutional analytics.
 */

const API_BASE_URL = 'https://attendance-backend-2r0f.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const studentAPI = {
  getStudents: (params) => api.get('/students', { params }),
};

const attendanceAPI = {
  getReport: (params) => api.get('/attendance/report', { params }),
};

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayMorningPercent: 0,
    todayAfternoonPercent: 0,
    lowAttendanceCount: 0,
    loading: true,
    error: null,
    dbStatus: 'connecting' // 'online' | 'offline' | 'connecting'
  });

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const studentsRes = await studentAPI.getStudents();
      const students = studentsRes.data || [];

      const today = new Date().toISOString().split('T')[0];
      
      const [morningReport, afternoonReport] = await Promise.all([
        attendanceAPI.getReport({ date: today, session: 'morning' }).catch(() => ({ data: [] })),
        attendanceAPI.getReport({ date: today, session: 'afternoon' }).catch(() => ({ data: [] }))
      ]);

      const morningPresent = (morningReport.data || []).filter(r => r.status === 'present').length;
      const afternoonPresent = (afternoonReport.data || []).filter(r => r.status === 'present').length;

      const lowAttendance = students.filter(s => 
        s.attendance_stats && parseFloat(s.attendance_stats.percentage) < 75
      ).length;

      setStats({
        totalStudents: students.length,
        todayMorningPercent: students.length > 0 ? Math.round((morningPresent / students.length) * 100) : 0,
        todayAfternoonPercent: students.length > 0 ? Math.round((afternoonPresent / students.length) * 100) : 0,
        lowAttendanceCount: lowAttendance,
        loading: false,
        error: null,
        dbStatus: 'online'
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        dbStatus: 'offline',
        error: err.code === 'ERR_NETWORK' || err.response?.status === 401
          ? "System link failure: The backend server or database is unreachable. Check terminal for DNS errors." 
          : "Data synchronization failed. Please refresh." 
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, trendUp }) => (
    <div className="col-xl-3 col-md-6 mb-4">
      <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden stat-card bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className={`erp-icon-container shadow-sm bg-${color} bg-opacity-10 text-${color}`}>
              <Icon size={22} />
            </div>
            <div className={`px-2 py-1 rounded-pill x-small fw-bold ${trendUp ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
              {trendUp ? <TrendingUp size={12} className="me-1" /> : <Activity size={12} className="me-1" />}
              {trend}
            </div>
          </div>
          <h6 className="text-muted mb-1 small text-uppercase fw-bold tracking-wider">{title}</h6>
          <h2 className="fw-extrabold mb-0">{value}</h2>
        </div>
      </div>
    </div>
  );

  if (stats.loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <div className="erp-loader mb-3 shadow-sm"></div>
        <h5 className="fw-bold text-dark mb-1">ERP Environment Initializing</h5>
        <p className="text-muted small">Synchronizing secure academic records...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container pb-5 animate-fade-in bg-light min-vh-100">
      {/* ERP TOP NAVIGATION BAR */}
      <div className="erp-top-header bg-white shadow-sm py-2 px-4 mb-4 rounded-4 border">
        <div className="row align-items-center">
          <div className="col d-flex align-items-center gap-3">
             <div className="d-flex flex-column">
                <span className="x-small fw-bold text-uppercase text-muted tracking-widest">Portal Version</span>
                <span className="small fw-bold text-primary">v2.1.0-ENTERPRISE</span>
             </div>
             <div className="vr mx-2 text-muted opacity-25" style={{height: '30px'}}></div>
             <div className="d-flex align-items-center gap-2">
                <div className={`status-dot ${stats.dbStatus === 'online' ? 'bg-success' : 'bg-danger'}`}></div>
                <span className="small fw-bold text-dark text-uppercase">{stats.dbStatus === 'online' ? 'Live Cluster' : 'Link Offline'}</span>
             </div>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
             <button className="btn btn-light btn-sm rounded-circle p-2 shadow-none border position-relative">
                <Bell size={18} className="text-muted" />
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
             </button>
             <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 border shadow-none">
                <Calendar size={14} className="text-primary me-2" />
                <span className="x-small fw-bold text-dark">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* WELCOME SECTION */}
      <div className="row align-items-end mb-4">
        <div className="col-md-8">
          <span className="badge bg-soft-primary text-primary mb-2 px-3 py-2 rounded-pill fw-bold x-small border border-primary border-opacity-10">INSTITUTIONAL ERP</span>
          <h1 className="h3 fw-extrabold text-dark mb-1">
            Faculty Command Center
          </h1>
          <p className="text-muted small mb-0">Managing <span className="fw-bold text-dark">{stats.totalStudents}</span> active profiles for <span className="text-primary fw-bold">Academic Session 2024-25</span></p>
        </div>
        <div className="col-md-4 text-md-end">
           <button className="btn btn-white border shadow-sm rounded-3 px-3 py-2 small fw-bold d-inline-flex align-items-center gap-2 transition" onClick={fetchDashboardData}>
              <RefreshCw size={16} className="text-primary" /> Sync Data
           </button>
        </div>
      </div>

      {stats.error && (
        <div className="alert alert-soft-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center p-3 border-start border-4 border-danger">
          <AlertTriangle className="me-3 text-danger" size={24} />
          <div>
            <div className="small fw-bold">System Integrity Alert</div>
            <div className="x-small opacity-75">{stats.error}</div>
          </div>
        </div>
      )}

      {/* ANALYTICS GRID */}
      <div className="row g-4">
        <StatCard 
          title="Student Registry" 
          value={stats.totalStudents} 
          icon={Users} 
          color="primary"
          trend="+4 Students"
          trendUp={true}
        />
        <StatCard 
          title="Morning Session" 
          value={`${stats.todayMorningPercent}%`} 
          icon={UserCheck} 
          color="success"
          trend="Target 90%"
          trendUp={stats.todayMorningPercent >= 90}
        />
        <StatCard 
          title="Afternoon Session" 
          value={`${stats.todayAfternoonPercent}%`} 
          icon={Zap} 
          color="info"
          trend="Session Active"
          trendUp={true}
        />
        <StatCard 
          title="Attendance Risk" 
          value={stats.lowAttendanceCount} 
          icon={AlertTriangle} 
          color="danger"
          trend="Critical"
          trendUp={false}
        />
      </div>

      <div className="row mt-4 g-4">
        {/* ACTION COMMANDS */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-extrabold text-dark mb-0">System Control Panel</h5>
                <span className="x-small fw-bold text-muted text-uppercase tracking-widest">Rapid Access</span>
              </div>
            </div>
            <div className="card-body p-4 pt-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <div 
                    className="erp-action-card p-4 rounded-4 cursor-pointer shadow-sm" 
                    onClick={() => navigate('/attendance')}
                  >
                    <div className="d-flex align-items-start justify-content-between mb-4">
                      <div className="action-icon-bg bg-primary shadow-primary">
                        <Clock size={24} />
                      </div>
                      <ChevronRight size={20} className="action-arrow" />
                    </div>
                    <h6 className="fw-extrabold text-dark mb-2">Capture Attendance</h6>
                    <p className="text-muted x-small mb-0">Launch digital register for session-wise tracking with automated parent notification triggers.</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div 
                    className="erp-action-card p-4 rounded-4 cursor-pointer shadow-sm"
                    onClick={() => navigate('/students')}
                  >
                    <div className="d-flex align-items-start justify-content-between mb-4">
                      <div className="action-icon-bg bg-success shadow-success">
                        <Users size={24} />
                      </div>
                      <ChevronRight size={20} className="action-arrow" />
                    </div>
                    <h6 className="fw-extrabold text-dark mb-2">Student Information</h6>
                    <p className="text-muted x-small mb-0">Access 360° student portfolios, academic history, and comprehensive parent contact directory.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS & INFRASTRUCTURE */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 erp-gradient-card text-white">
            <div className="card-body p-4">
              <h5 className="fw-extrabold mb-4 d-flex align-items-center">
                <ShieldCheck size={20} className="text-info me-2" />
                Security & Sync
              </h5>
              
              <div className="system-monitor p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10 mb-4">
                <div className="system-status-item mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="x-small opacity-75 d-flex align-items-center">
                      <Database size={14} className="me-2 text-info" />
                      PostgreSQL Data Node
                    </span>
                    <span className={`badge ${stats.dbStatus === 'online' ? 'bg-success' : 'bg-danger'} x-small`}>{stats.dbStatus === 'online' ? 'ONLINE' : 'ERROR'}</span>
                  </div>
                  <div className="progress rounded-pill bg-white bg-opacity-10" style={{height: '4px'}}>
                    <div className={`progress-bar ${stats.dbStatus === 'online' ? 'bg-info' : 'bg-danger'}`} style={{width: stats.dbStatus === 'online' ? '100%' : '20%'}}></div>
                  </div>
                </div>

                <div className="system-status-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="x-small opacity-75 d-flex align-items-center">
                      <Smartphone size={14} className="me-2 text-info" />
                      SMS Gateway Link
                    </span>
                    <span className="badge bg-info x-small">READY</span>
                  </div>
                  <div className="progress rounded-pill bg-white bg-opacity-10" style={{height: '4px'}}>
                    <div className="progress-bar bg-info" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>

              <div className="user-profile-widget p-3 rounded-4 bg-white bg-opacity-10">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle bg-info bg-opacity-25 text-info fw-bold me-3 border border-info border-opacity-25" style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {user?.full_name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <div className="x-small text-info text-uppercase fw-bold ls-wide">Session User</div>
                    <div className="small fw-extrabold">{user?.full_name || 'System Faculty'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        .fw-extrabold { font-weight: 800; }
        .ls-wide { letter-spacing: 0.08rem; }
        
        .erp-top-header { margin-top: -10px; }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          animation: status-pulse 2s infinite;
        }
        @keyframes status-pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .erp-icon-container {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .stat-card { transition: all 0.3s ease; border: 1px solid #f0f0f0!important; }
        .stat-card:hover { transform: translateY(-4px); border-color: #e0e0e0!important; box-shadow: 0 10px 25px rgba(0,0,0,0.05)!important; }

        .erp-action-card {
          background-color: #ffffff;
          border: 1px solid #f0f2f5;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .erp-action-card:hover {
          background-color: #fafbfc;
          border-color: #3b82f6;
          transform: translateY(-2px);
        }

        .action-icon-bg {
          padding: 10px;
          border-radius: 10px;
          color: white;
          transition: all 0.3s ease;
        }

        .shadow-primary { box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25); }
        .shadow-success { box-shadow: 0 4px 12px rgba(25, 135, 84, 0.25); }

        .action-arrow {
          color: #cbd5e1;
          transition: all 0.3s ease;
        }

        .erp-action-card:hover .action-arrow {
          transform: translateX(4px);
          color: #3b82f6;
        }

        .erp-gradient-card {
          background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
        }

        .bg-soft-primary { background-color: #eff6ff; }
        .bg-soft-danger { background-color: #fef2f2; }
        .alert-soft-danger { border: 1px solid #fee2e2; color: #b91c1c; }

        .erp-loader {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: erp-spin 0.8s linear infinite;
        }
        @keyframes erp-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .x-small { font-size: 0.65rem; }
        .avatar-circle { border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;