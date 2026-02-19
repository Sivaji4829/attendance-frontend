// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Lock, Mail, AlertCircle } from 'lucide-react';

/**
 * Login Component
 * Handles user authentication and session initiation.
 * @param {Function} onLogin - Callback function passed from App.jsx to update global auth state.
 */
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error when user starts typing
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      // Call the parent handler to set the user in App state and localStorage
      onLogin(response.data);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to login. Please check your connection.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center min-vh-100 bg-light mx-0">
      <div className="col-md-4 col-sm-8">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <Lock className="text-primary" size={32} />
              </div>
              <h2 className="fw-bold text-dark">Faculty Login</h2>
              <p className="text-muted small">Enter your credentials to manage attendance</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center py-2" role="alert">
                <AlertCircle size={18} className="me-2" />
                <div className="small">{error}</div>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded-3 d-flex align-items-center justify-content-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                Forgot password? Contact the administrator.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-muted x-small">
            &copy; {new Date().getFullYear()} College Attendance System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;