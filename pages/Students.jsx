import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Trash2, Edit3, UserPlus, Phone, BarChart2,
  AlertCircle, Plus, RefreshCcw, MessageSquare, GraduationCap, BookOpen, 
  X, ChevronRight, UserCircle, Calendar, Shield, MoreHorizontal,
  Mail, MapPin
} from 'lucide-react';
import axios from 'axios';

// --- API CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const studentAPI = {
  getStudents: (params) => api.get('/students', { params }),
  addStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data), 
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

const academicAPI = {
  getYears: () => api.get('/academic/years').catch(() => ({ data: [] })),
  getBranches: () => api.get('/academic/branches').catch(() => ({ data: [] })),
  getSections: () => api.get('/academic/sections').catch(() => ({ data: [] })),
  getCourses: () => api.get('/academic/courses').catch(() => ({ data: [] })),
};

/**
 * Students Component - Card Based Professional UI
 */
const Students = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ year_id: '', branch_id: '' });
  
  // Metadata States
  const [meta, setMeta] = useState({ years: [], branches: [], sections: [], courses: [] });

  // Modal & View States
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'details' | null
  const [activeStudent, setActiveStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(null);

  const initialForm = {
    roll_number: '', full_name: '', parent_phone: '',
    course_id: '', year_id: '', branch_id: '', section_id: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchMetadata(); }, []);
  useEffect(() => { fetchStudents(); }, [filters]);

  const fetchMetadata = async () => {
    try {
      const [y, b, s, c] = await Promise.all([
        academicAPI.getYears(), academicAPI.getBranches(),
        academicAPI.getSections(), academicAPI.getCourses()
      ]);
      setMeta({ years: y.data, branches: b.data, sections: s.data, courses: c.data });
    } catch (e) { console.error("Meta error", e); }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getStudents(filters);
      setStudents(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to sync records with database.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setActiveStudent(s);
    setFormData({
      roll_number: s.roll_number,
      full_name: s.full_name,
      parent_phone: s.parent_phone,
      course_id: s.course_id || '',
      year_id: s.year_id || '',
      branch_id: s.branch_id || '',
      section_id: s.section_id || ''
    });
    setModalType('edit');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Archive record for ${name}?`)) return;
    try {
      await studentAPI.deleteStudent(id);
      fetchStudents();
    } catch (err) { alert("Delete failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (modalType === 'add') {
        await studentAPI.addStudent(formData);
      } else {
        await studentAPI.updateStudent(activeStudent.id, formData);
      }
      setModalType(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTestSMS = async (s) => {
    setSmsLoading(s.id);
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/sms/send', { student_id: s.id, date: today, session: 'morning' });
      alert(`Test SMS sent to ${s.parent_phone}`);
    } catch (err) {
      alert("SMS Failed. Check Fast2SMS API Key.");
    } finally {
      setSmsLoading(null);
    }
  };

  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 px-lg-5 bg-light min-vh-100">
      {/* Page Header */}
      <div className="row align-items-center mb-5 g-3">
        <div className="col-md">
          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            <GraduationCap className="text-primary" size={32} />
            Student Management
          </h1>
          <p className="text-muted small mb-0">Manage profiles, academic data, and parent alerts.</p>
        </div>
        <div className="col-md-auto d-flex gap-2">
          <button className="btn btn-white border shadow-sm rounded-pill px-3 py-2 btn-sm d-flex align-items-center gap-2" onClick={fetchStudents}>
            <RefreshCcw size={16} className={loading ? 'spin' : ''} />
            Sync
          </button>
          {user?.role === 'admin' && (
            <button className="btn btn-primary rounded-pill px-4 py-2 btn-sm d-flex align-items-center gap-2 shadow-sm" onClick={() => { setFormData(initialForm); setModalType('add'); }}>
              <Plus size={18} />
              Register Student
            </button>
          )}
        </div>
      </div>

      {/* Modern Filter Strip */}
      <div className="card border-0 shadow-sm rounded-4 mb-5">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-lg-4">
              <div className="input-group bg-light rounded-pill px-2 border-0">
                <span className="input-group-text bg-transparent border-0 text-muted ps-3"><Search size={18} /></span>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 py-2 shadow-none small" 
                  placeholder="Search by name or roll number..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>
            <div className="col-md-3 col-lg-2">
              <select className="form-select border-0 bg-light rounded-pill px-3 small shadow-none" value={filters.year_id} onChange={e => setFilters({...filters, year_id: e.target.value})}>
                <option value="">All Years</option>
                {meta.years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
              </select>
            </div>
            <div className="col-md-3 col-lg-2">
              <select className="form-select border-0 bg-light rounded-pill px-3 small shadow-none" value={filters.branch_id} onChange={e => setFilters({...filters, branch_id: e.target.value})}>
                <option value="">All Branches</option>
                {meta.branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4">{error}</div>}

      {/* Student Cards Grid */}
      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Refreshing directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
            <Users size={48} className="text-muted mb-3 opacity-25" />
            <p className="text-muted">No students found matching your search criteria.</p>
          </div>
        ) : filtered.map(s => (
          <div className="col-xl-3 col-lg-4 col-md-6" key={s.id}>
            <div className="card border-0 shadow-sm h-100 rounded-4 student-card transition">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="avatar bg-primary-subtle text-primary fw-bold rounded-4 d-flex align-items-center justify-content-center" style={{width: 54, height: 54, fontSize: '1.2rem'}}>
                    {s.full_name[0]}
                  </div>
                  <div className="dropdown">
                    <button className="btn btn-light btn-sm border-0 bg-transparent text-muted p-1 rounded-circle" data-bs-toggle="dropdown">
                      <MoreHorizontal size={20} />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                      <li><button className="dropdown-item py-2 small d-flex align-items-center gap-2" onClick={() => handleEdit(s)}><Edit3 size={14}/> Edit Profile</button></li>
                      {user?.role === 'admin' && (
                        <li><button className="dropdown-item py-2 small text-danger d-flex align-items-center gap-2" onClick={() => handleDelete(s.id, s.full_name)}><Trash2 size={14}/> Delete</button></li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-dark mb-0">{s.full_name}</h6>
                  <span className="text-muted small font-monospace text-uppercase tracking-wider">{s.roll_number}</span>
                </div>

                <div className="academic-pills mb-3 d-flex flex-wrap gap-1">
                  <span className="badge bg-light text-primary border-0 px-2 py-1 small fw-medium">{s.branch_name}</span>
                  <span className="badge bg-light text-secondary border-0 px-2 py-1 small fw-medium">{s.year_name}</span>
                  <span className="badge bg-light text-dark border-0 px-2 py-1 small fw-medium">Sec {s.section_name}</span>
                </div>

                <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                  <div className="small text-muted d-flex align-items-center gap-2">
                    <Phone size={14} className="text-primary" />
                    {s.parent_phone}
                  </div>
                  <div className="d-flex gap-1">
                    <button 
                      className={`btn btn-sm rounded-3 btn-light border-0 ${smsLoading === s.id ? 'text-warning' : 'text-success'}`} 
                      title="Test SMS" 
                      onClick={() => handleTestSMS(s)}
                      disabled={smsLoading === s.id}
                    >
                      {smsLoading === s.id ? <RefreshCcw size={16} className="spin" /> : <MessageSquare size={16} />}
                    </button>
                    <button className="btn btn-sm rounded-3 btn-light border-0 text-primary" title="View Profile" onClick={() => { setActiveStudent(s); setModalType('details'); }}>
                      <BarChart2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Modal Layer */}
      {modalType && (
        <div className="modal-backdrop show" style={{background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', zIndex: 1040}}>
          <div className="modal show d-block" style={{zIndex: 1050}}>
            <div className={`modal-dialog modal-dialog-centered ${modalType === 'details' ? 'modal-md' : 'modal-lg'}`}>
              <div className="modal-content border-0 shadow-lg rounded-5 overflow-hidden">
                
                {/* Details Overlay */}
                {modalType === 'details' && activeStudent && (
                  <div className="modal-body p-0">
                    <div className="bg-primary p-5 text-white text-center position-relative">
                      <button className="btn-close btn-close-white position-absolute end-0 top-0 m-4 shadow-none" onClick={() => setModalType(null)}></button>
                      <div className="bg-white text-primary rounded-circle mx-auto d-flex align-items-center justify-content-center fw-bold mb-3 shadow" style={{width: 90, height: 90, fontSize: '2.5rem'}}>
                        {activeStudent.full_name[0]}
                      </div>
                      <h4 className="fw-bold mb-1">{activeStudent.full_name}</h4>
                      <p className="small opacity-75 mb-0 tracking-widest">{activeStudent.roll_number}</p>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="row g-3 mb-4">
                        <div className="col-6">
                          <div className="p-3 bg-light rounded-4 text-center">
                            <BookOpen size={18} className="text-primary mb-2" />
                            <div className="x-small text-muted text-uppercase fw-bold mb-1">Year</div>
                            <div className="fw-bold">{activeStudent.year_name}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-3 bg-light rounded-4 text-center">
                            <Users size={18} className="text-primary mb-2" />
                            <div className="x-small text-muted text-uppercase fw-bold mb-1">Section</div>
                            <div className="fw-bold">{activeStudent.section_name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="list-group list-group-flush rounded-4 overflow-hidden border">
                        <div className="list-group-item d-flex justify-content-between py-3">
                          <span className="text-muted small">Department</span>
                          <span className="fw-bold small">{activeStudent.branch_name}</span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between py-3">
                          <span className="text-muted small">Guardian Phone</span>
                          <span className="fw-bold small font-monospace">{activeStudent.parent_phone}</span>
                        </div>
                      </div>
                      <div className="mt-4 d-flex gap-2">
                        <button className="btn btn-primary w-100 rounded-pill py-2 shadow-sm" onClick={() => handleEdit(activeStudent)}>Edit Profile</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add / Edit Form */}
                {(modalType === 'add' || modalType === 'edit') && (
                  <>
                    <div className={`p-4 text-white ${modalType === 'edit' ? 'bg-indigo' : 'bg-primary'}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">{modalType === 'edit' ? 'Update Profile' : 'Student Onboarding'}</h5>
                        <button className="btn-close btn-close-white shadow-none" onClick={() => setModalType(null)}></button>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 bg-white">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2">Full Legal Name</label>
                          <input type="text" className="form-control bg-light border-0 py-2 rounded-3" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2">University Roll ID</label>
                          <input type="text" className="form-control bg-light border-0 py-2 rounded-3" required value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} disabled={modalType === 'edit'} />
                        </div>
                        <div className="col-md-6">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2">Parent Contact (10 Digits)</label>
                          <input type="text" className="form-control bg-light border-0 py-2 rounded-3" required pattern="[0-9]{10}" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2">Year of Study</label>
                          <select className="form-select bg-light border-0 py-2 rounded-3" required value={formData.year_id} onChange={e => setFormData({...formData, year_id: e.target.value})}>
                            <option value="">Select Year</option>
                            {meta.years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2">Department / Branch</label>
                          <select className="form-select bg-light border-0 py-2 rounded-3" required value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
                            <option value="">Select Branch</option>
                            {meta.branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2">Class Section</label>
                          <select className="form-select bg-light border-0 py-2 rounded-3" required value={formData.section_id} onChange={e => setFormData({...formData, section_id: e.target.value})}>
                            <option value="">Select Section</option>
                            {meta.sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2">Enrolled Course</label>
                          <select className="form-select bg-light border-0 py-2 rounded-3" required value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})}>
                            <option value="">Select Course</option>
                            {meta.courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mt-5 d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-light px-4 py-2 border rounded-pill small" onClick={() => setModalType(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill shadow-sm small fw-bold" disabled={formLoading}>
                          {formLoading ? <div className="spinner-border spinner-border-sm"></div> : (modalType === 'edit' ? 'Update Database' : 'Finalize Registration')}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .student-card { transition: all 0.25s ease; border-radius: 1.25rem; }
        .student-card:hover { transform: translateY(-5px); box-shadow: 0 1rem 2rem rgba(0,0,0,0.08)!important; }
        
        .bg-primary-subtle { background-color: #eef2ff; color: #4f46e5; }
        .bg-indigo { background-color: #6366f1; }
        
        .x-small { font-size: 0.65rem; }
        .ls-wide { letter-spacing: 0.05em; }
        
        .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transition: 0.2s; border-radius: 10px; }
        .btn-icon:hover { transform: scale(1.1); background-color: #f1f5f9; }
        
        .form-control:focus, .form-select:focus { background-color: white!important; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); border-color: #4f46e5; }
      `}</style>
    </div>
  );
};

export default Students;