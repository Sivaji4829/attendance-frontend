// frontend/src/pages/Attendance.jsx

import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  Users, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  BookOpen,
  Layers,
  CheckSquare,
  RefreshCcw
} from 'lucide-react';
import axios from 'axios';

// --- LOCAL API SERVICE CONFIGURATION ---
// Bundled locally to resolve esbuild path resolution errors
const API_BASE_URL = 'https://attendance-backend-2r0f.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage for authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const studentAPI = {
  getStudents: (params) => api.get('/students', { params }),
};

const attendanceAPI = {
  markAttendance: (data) => api.post('/attendance', data),
};

const academicAPI = {
  getYears: () => api.get('/academic/years'),
  getBranches: () => api.get('/academic/branches'),
  getSections: () => api.get('/academic/sections'),
  getCourses: () => api.get('/academic/courses'),
};

/**
 * Attendance Component
 * Handles session-wise attendance marking with advanced academic filtering.
 * Professional High-End ERP Design.
 */
const Attendance = ({ user }) => {
  const [params, setParams] = useState({
    date: new Date().toISOString().split('T')[0],
    session: 'morning',
    course_id: '',
    year_id: '',
    branch_id: '',
    section_id: ''
  });

  const [metadata, setMetadata] = useState({
    courses: [],
    years: [],
    branches: [],
    sections: []
  });

  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all academic metadata on mount to populate ERP filters
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cRes, yRes, bRes, sRes] = await Promise.all([
          academicAPI.getCourses().catch(() => ({ data: [] })),
          academicAPI.getYears().catch(() => ({ data: [] })),
          academicAPI.getBranches().catch(() => ({ data: [] })),
          academicAPI.getSections().catch(() => ({ data: [] }))
        ]);
        setMetadata({
          courses: cRes.data || [],
          years: yRes.data || [],
          branches: bRes.data || [],
          sections: sRes.data || []
        });
      } catch (err) {
        console.error("Failed to load academic metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  const loadStudents = async () => {
    // Basic validation to prevent loading massive unstructured lists
    if (!params.branch_id && !params.year_id && !params.section_id) {
      setMessage({ type: 'warning', text: 'Please refine your filters (Year, Branch or Section) to load the roster.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await studentAPI.getStudents({
        course_id: params.course_id,
        year_id: params.year_id,
        branch_id: params.branch_id,
        section_id: params.section_id
      });
      
      const fetchedStudents = response.data || [];
      setStudents(fetchedStudents);
      
      // Default everyone to 'present' initially for faster marking
      const initialAttendance = {};
      fetchedStudents.forEach(s => {
        initialAttendance[s.id] = 'present';
      });
      setAttendanceData(initialAttendance);
      
      if (fetchedStudents.length === 0) {
        setMessage({ type: 'info', text: 'No students found matching current institutional filters.' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Roster retrieval failed. Check database connectivity.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) return;

    if (!window.confirm(`Finalize attendance for ${params.session} session? Parent alerts will be triggered.`)) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        date: params.date,
        session: params.session,
        attendance_data: Object.keys(attendanceData).map(id => ({
          student_id: parseInt(id),
          status: attendanceData[id]
        }))
      };

      await attendanceAPI.markAttendance(payload);
      setMessage({ type: 'success', text: 'Attendance synchronized with cloud. Automated SMS alerts queued.' });
      
      // Clear roster to prevent duplicate submission
      setStudents([]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Submission error: Entry likely already exists for this session.';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="attendance-container pb-5 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="d-md-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="badge bg-soft-primary text-primary mb-2 rounded-pill x-small fw-bold">TRACKING CONSOLE</span>
          <h2 className="fw-extrabold text-dark mb-1">Session Attendance</h2>
          <p className="text-muted small mb-0">Manage digital registers with real-time academic filtering.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
           <div className="bg-white border rounded-3 px-3 py-2 shadow-sm d-flex align-items-center">
              <CheckSquare size={16} className="text-success me-2" />
              <span className="small fw-bold">Present: {Object.values(attendanceData).filter(v => v === 'present').length}</span>
           </div>
           <div className="bg-white border rounded-3 px-3 py-2 shadow-sm d-flex align-items-center">
              <XCircle size={16} className="text-danger me-2" />
              <span className="small fw-bold">Absent: {Object.values(attendanceData).filter(v => v === 'absent').length}</span>
           </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-soft-${message.type === 'danger' ? 'danger' : message.type} border-0 shadow-sm rounded-4 d-flex align-items-center mb-4 p-3`}>
          {message.type === 'success' ? <CheckCircle2 className="me-3 text-success" size={24} /> : <AlertCircle className="me-3" size={24} />}
          <div className="small fw-bold">{message.text}</div>
        </div>
      )}

      <div className="row g-4">
        {/* ERP CONFIGURATION PANEL */}
        <div className="col-xl-4 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '5.5rem' }}>
            <div className="card-body p-4">
              <h6 className="fw-extrabold text-dark mb-4 d-flex align-items-center text-uppercase tracking-wider">
                <Filter size={18} className="me-2 text-primary" />
                Register Config
              </h6>
              
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Academic Date</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-0 text-muted"><Calendar size={16} /></span>
                    <input type="date" className="form-control bg-light border-0 py-2" value={params.date} onChange={(e) => setParams({...params, date: e.target.value})} max={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Session Slot</label>
                  <div className="d-flex gap-2">
                    <button className={`btn flex-grow-1 py-2 rounded-3 btn-sm fw-bold transition ${params.session === 'morning' ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`} onClick={() => setParams({...params, session: 'morning'})}>Morning</button>
                    <button className={`btn flex-grow-1 py-2 rounded-3 btn-sm fw-bold transition ${params.session === 'afternoon' ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`} onClick={() => setParams({...params, session: 'afternoon'})}>Afternoon</button>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Course</label>
                  <select className="form-select form-select-sm bg-light border-0" value={params.course_id} onChange={(e) => setParams({...params, course_id: e.target.value})}>
                    <option value="">All Courses</option>
                    {metadata.courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Year</label>
                  <select className="form-select form-select-sm bg-light border-0" value={params.year_id} onChange={(e) => setParams({...params, year_id: e.target.value})}>
                    <option value="">All Years</option>
                    {metadata.years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Branch / Department</label>
                  <select className="form-select form-select-sm bg-light border-0" value={params.branch_id} onChange={(e) => setParams({...params, branch_id: e.target.value})}>
                    <option value="">Select Branch</option>
                    {metadata.branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label x-small fw-bold text-muted text-uppercase">Section</label>
                  <select className="form-select form-select-sm bg-light border-0" value={params.section_id} onChange={(e) => setParams({...params, section_id: e.target.value})}>
                    <option value="">All Sections</option>
                    {metadata.sections
                      .filter(s => !params.branch_id || s.branch_id === parseInt(params.branch_id))
                      .map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)
                    }
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <button className="btn btn-primary w-100 py-2 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={loadStudents} disabled={loading}>
                  {loading ? <RefreshCcw size={18} className="spin" /> : <Layers size={18} />}
                  Initialize Roster
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ROSTER LIST PANEL */}
        <div className="col-xl-8 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white p-4 border-0">
              <div className="d-md-flex justify-content-between align-items-center">
                <h5 className="fw-extrabold text-dark mb-3 mb-md-0 d-flex align-items-center gap-2">
                  Institutional Register 
                  {students.length > 0 && <span className="badge bg-soft-primary text-primary px-2">{students.length}</span>}
                </h5>
                {students.length > 0 && (
                  <div className="input-group" style={{ maxWidth: '250px' }}>
                    <span className="input-group-text bg-light border-0 text-muted ps-3"><Search size={16} /></span>
                    <input type="text" className="form-control bg-light border-0 py-2 shadow-none small" placeholder="Search roster..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                )}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold">Student Portfolio</th>
                    <th className="py-3 border-0 text-muted small text-uppercase fw-bold text-center">Status Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="2" className="text-center py-5">
                        <div className="erp-loader mx-auto mb-3"></div>
                        <p className="text-muted small fw-bold">Syncing with Academic Core...</p>
                      </td>
                    </tr>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="transition border-light">
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className={`avatar-box rounded-3 me-3 fw-bold small d-flex align-items-center justify-content-center shadow-sm transition ${attendanceData[student.id] === 'absent' ? 'bg-danger text-white' : 'bg-primary-subtle text-primary'}`} style={{ width: '42px', height: '42px' }}>
                              {student.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{student.full_name}</div>
                              <div className="text-muted x-small text-uppercase ls-wide font-monospace tracking-tighter">{student.roll_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3">
                          <div className="btn-group erp-status-toggle rounded-pill border p-1 bg-light shadow-sm">
                            <button className={`btn btn-sm px-4 rounded-pill border-0 d-flex align-items-center gap-2 fw-bold transition ${attendanceData[student.id] === 'present' ? 'bg-success text-white shadow-sm' : 'text-muted'}`} onClick={() => handleStatusChange(student.id, 'present')}>
                              <CheckCircle2 size={16} /> Present
                            </button>
                            <button className={`btn btn-sm px-4 rounded-pill border-0 d-flex align-items-center gap-2 fw-bold transition ${attendanceData[student.id] === 'absent' ? 'bg-danger text-white shadow-sm' : 'text-muted'}`} onClick={() => handleStatusChange(student.id, 'absent')}>
                              <XCircle size={16} /> Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center py-5 text-muted bg-light bg-opacity-50 border-0">
                        <div className="opacity-25 mb-3"><Users size={48} className="mx-auto" /></div>
                        <p className="small fw-bold mb-0">Register is currently inactive. Configure filters to begin.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {students.length > 0 && (
              <div className="card-footer bg-white p-4 border-0">
                <button className="btn btn-primary w-100 py-3 rounded-4 fw-extrabold shadow-primary d-flex align-items-center justify-content-center gap-2 transition-scale" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <span className="spinner-border spinner-border-sm"></span> : <Save size={20} />}
                  COMMIT RECORDS & SYNC CLOUD
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        .fw-extrabold { font-weight: 800; }
        .x-small { font-size: 0.65rem; }
        .ls-wide { letter-spacing: 0.08rem; }
        
        .bg-primary-subtle { background-color: #eff6ff; }
        .bg-soft-primary { background-color: #eff6ff; }
        
        .alert-soft-danger { background-color: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c; }
        .alert-soft-warning { background-color: #fffbeb; border: 1px solid #fef3c7; color: #92400e; }
        .alert-soft-success { background-color: #f0fdf4; border: 1px solid #dcfce7; color: #15803d; }

        .erp-loader {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: erp-spin 0.8s linear infinite;
        }
        @keyframes erp-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin { animation: erp-spin 0.8s linear infinite; }

        .erp-status-toggle { background-color: #f8fafc!important; }
        .transition { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .transition-scale:active { transform: scale(0.98); }
        
        .shadow-primary { box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4); }
        
        .avatar-box { transition: all 0.3s ease; }
        
        .form-select-sm, .form-control-sm { border-radius: 8px; }
        .form-select:focus, .form-control:focus {
           box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
           border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default Attendance;