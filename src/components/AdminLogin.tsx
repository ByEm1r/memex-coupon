import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/auth.css';

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await onLogin(password);
      toast.success('Successfully logged in as admin');
    } catch (error) {
      toast.error('Login failed. Incorrect password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src="https://images.pexels.com/photos/6585763/pexels-photo-6585763.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Admin Portal"
            className="auth-logo"
          />
          <h2 className="auth-title">Admin Portal</h2>
          <p className="auth-subtitle">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">Admin Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner" />
                Authenticating...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;