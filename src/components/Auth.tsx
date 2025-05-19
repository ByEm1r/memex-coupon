import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Building2, MapPin, Globe, Copy, ArrowLeft, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase';
import { hashPassword, verifyPassword } from '../lib/auth';

interface AuthProps {
  type: 'signIn' | 'signUp';
  setActiveTab: (tab: string) => void;
  setUser: (user: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

const countries = [
  'All Countries',
  'USA', 'Canada', 'UK', 'Germany', 'France', 'Turkey', 'Australia', 'Japan',
  'China', 'India', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Russia',
  'South Africa', 'Nigeria', 'Egypt', 'Saudi Arabia', 'United Arab Emirates',
  'Singapore', 'South Korea', 'Argentina', 'Colombia', 'Peru', 'Chile',
  'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece', 'Poland', 'Hungary',
  'Czech Republic', 'Romania', 'Ukraine', 'Vietnam', 'Thailand', 'Indonesia',
  'Malaysia', 'Philippines', 'New Zealand', 'Other'
];

const Auth: React.FC<AuthProps> = ({ type, setActiveTab, setUser, setIsAdmin }) => {
  const [memexAmount, setMemexAmount] = useState(0);
  const [paymentAddress, setPaymentAddress] = useState('');
  const [formData, setFormData] = useState({
    storeName: '',
    brandDescription: '',
    brandWebsite: '',
    country: '',
    email: '',
    password: '',
    showPassword: false,
    paymentMade: false,
    termsAccepted: false,
    transactionHash: ''
  });

  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [currentView, setCurrentView] = useState<'signIn' | 'signUp' | 'forgotPassword'>(type);
  const [showTerms, setShowTerms] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('memex_amount, memex_address')
            .single();

        if (error) throw error;

        if (data) {
          setMemexAmount(data.memex_amount || 0);
          setPaymentAddress(data.memex_address || '');
        }
      } catch (error) {
        console.error('Error fetching app settings:', error);
        toast.error('Failed to load payment settings');
      }
    };

    fetchAppSettings();
  }, []);

  useEffect(() => {
    if (currentView === 'signUp' && paymentAddress) {
      generateQrCode();
    }
  }, [currentView, paymentAddress]);

  const generateQrCode = async () => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(paymentAddress);
      setQrCode(qrCodeDataURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const togglePasswordVisibility = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const copyPaymentAddress = () => {
    navigator.clipboard.writeText(paymentAddress)
        .then(() => {
          setShowCopiedTooltip(true);
          setTimeout(() => setShowCopiedTooltip(false), 2000);
          toast.success('Payment address copied to clipboard');
        })
        .catch(() => toast.error('Failed to copy payment address'));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: user } = await supabase
          .from('custom_users')
          .select('id')
          .eq('email', resetEmail)
          .single();

      if (!user) {
        toast.error('Store not found');
        return;
      }

      const { error } = await supabase
          .from('password_reset_requests')
          .insert({
            user_id: user.id,
            email: resetEmail
          });

      if (error) throw error;

      toast.success('Password reset request submitted. Please wait for admin approval');
      setCurrentView('signIn');
      setResetEmail('');
    } catch (error) {
      toast.error('Failed to submit password reset request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (currentView === 'signUp') {
        if (!formData.termsAccepted) {
          toast.error('Please accept the terms and conditions');
          return;
        }

        if (formData.paymentMade && !formData.transactionHash) {
          toast.error('Please enter the transaction hash');
          return;
        }

        const { error } = await supabase.from('custom_users').insert([{
          email: formData.email,
          password: formData.password,
          store_name: formData.storeName,
          brand_description: formData.brandDescription,
          brand_website: formData.brandWebsite,
          country: formData.country,
          payment_made: formData.paymentMade,
          payment_verified: false,
          is_admin: false,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          transaction_hash: formData.transactionHash
        }]);

        if (error) throw error;
        toast.success('Store account created successfully! Please sign in.');
        setCurrentView('signIn');
        setFormData({
          storeName: '',
          brandDescription: '',
          brandWebsite: '',
          country: '',
          email: '',
          password: '',
          showPassword: false,
          paymentMade: false,
          termsAccepted: false,
          transactionHash: ''
        });
      } else {
        // Check for admin login
        if (formData.email === import.meta.env.VITE_ADMIN_EMAIL && formData.password === import.meta.env.VITE_ADMIN_PASSWORD) {
          const adminUser = {
            email: import.meta.env.VITE_ADMIN_EMAIL,
            is_admin: true,
            isAdmin: true
          };

          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          setUser(adminUser);
          setIsAdmin(true);
          toast.success('Successfully logged in as admin');
          setActiveTab('admin');
          return;
        }

        // Regular user login
        const { data, error } = await supabase
            .from('custom_users')
            .select('*')
            .eq('email', formData.email)
            .single();

        if (error || !data) {
          toast.error('Invalid credentials');
          return;
        }

        if (data.password !== formData.password) {
          toast.error('Invalid credentials');
          return;
        }

        const userData = {
          ...data,
          isAdmin: data.is_admin
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);
        toast.success('Successfully logged in');
        setActiveTab('profile');
      }
    } catch (error) {
      toast.error(currentView === 'signUp' ? 'Registration failed' : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setCurrentView(currentView === 'signIn' ? 'signUp' : 'signIn');
    setFormData({
      storeName: '',
      brandDescription: '',
      brandWebsite: '',
      country: '',
      email: '',
      password: '',
      showPassword: false,
      paymentMade: false,
      termsAccepted: false,
      transactionHash: ''
    });
  };

  if (currentView === 'forgotPassword') {
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-primary to-dark-secondary">
          <div className="max-w-md w-full space-y-8">
            <div className="glass-card p-8 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setCurrentView('signIn')}
                    className="p-2 hover:bg-dark-tertiary rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-yellow to-brand-orange bg-clip-text text-transparent">
                  Reset Password
                </h2>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Store Email
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-dark-tertiary border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent text-white placeholder-gray-400"
                        placeholder="store@example.com"
                        required
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Enter your store email and we'll send a password reset request to the admin.
                  </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting Request...
                      </div>
                  ) : (
                      'Submit Reset Request'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-primary to-dark-secondary">
        <div className="max-w-7xl w-full space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-stretch bg-dark-tertiary rounded-2xl overflow-hidden shadow-2xl">
            <div className="w-full md:w-1/2 p-8 space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-blue via-brand-purple to-brand-teal bg-clip-text text-transparent">
                  {currentView === 'signIn' ? 'Welcome Back!' : 'Create Store Account'}
                </h2>
                <p className="mt-2 text-gray-400">
                  {currentView === 'signIn'
                      ? 'Sign in to manage your store'
                      : 'Join our marketplace and start selling'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {currentView === 'signUp' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Store Name
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                              type="text"
                              name="storeName"
                              value={formData.storeName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-dark-quaternary border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-white placeholder-gray-400"
                              placeholder="Your Store Name"
                              required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Brand Description
                        </label>
                        <textarea
                            name="brandDescription"
                            value={formData.brandDescription}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-dark-quaternary border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-white placeholder-gray-400"
                            placeholder="Tell us about your brand"
                            rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Brand Website
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                              type="url"
                              name="brandWebsite"
                              value={formData.brandWebsite}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-dark-quaternary border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-white placeholder-gray-400"
                              placeholder="https://yourbrand.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Country
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <select
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-dark-quaternary border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-white"
                              required
                          >
                            <option value="">Select your country</option>
                            {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                              type="checkbox"
                              name="termsAccepted"
                              checked={formData.termsAccepted}
                              onChange={handleInputChange}
                              className="form-checkbox h-4 w-4 text-brand-blue rounded border-gray-600"
                              required
                          />
                          <span className="text-sm text-gray-300">
                        I accept the{' '}
                            <button
                                type="button"
                                onClick={() => setShowTerms(true)}
                                className="text-brand-blue hover:text-brand-purple underline"
                            >
                          Terms and Conditions
                        </button>
                      </span>
                        </label>
                      </div>
                    </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Store Email
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-dark-tertiary border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-white placeholder-gray-400"
                        placeholder="store@example.com"
                        required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type={formData.showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 bg-dark-tertiary border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-white placeholder-gray-400"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {formData.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || (currentView === 'signUp' && !formData.termsAccepted)}
                    className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {currentView === 'signIn' ? 'Signing in...' : 'Creating account...'}
                      </div>
                  ) : (
                      currentView === 'signIn' ? 'Sign In' : 'Create Store Account'
                  )}
                </button>

                <div className="space-y-4 text-center">
                  <button
                      type="button"
                      onClick={toggleView}
                      className="text-brand-blue hover:text-brand-purple transition-colors"
                  >
                    {currentView === 'signIn' ? (
                        "Don't have a store account? Sign up"
                    ) : (
                        'Already have a store account? Sign in'
                    )}
                  </button>

                  {currentView === 'signIn' && (
                      <button
                          type="button"
                          onClick={() => setCurrentView('forgotPassword')}
                          className="block w-full text-brand-yellow hover:text-brand-orange transition-colors text-sm"
                      >
                        Forgot your password?
                      </button>
                  )}
                </div>
              </form>
            </div>

            {currentView === 'signUp' && (
                <div className="w-full md:w-1/2 bg-dark-quaternary p-8 space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Payment Information</h3>
                    <p className="text-gray-400">Complete your registration with MEMEX payment</p>
                  </div>

                  <div className="bg-dark-tertiary rounded-lg p-6 space-y-6">
                    {qrCode && (
                        <div className="flex justify-center">
                          <img
                              src={qrCode}
                              alt="Payment QR Code"
                              className="w-48 h-48 rounded-lg"
                          />
                        </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Payment Address
                        </label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 p-3 bg-dark-primary rounded-lg text-brand-blue font-mono text-sm break-all">
                            {paymentAddress}
                          </code>
                          <button
                              onClick={copyPaymentAddress}
                              className="p-3 bg-dark-primary rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Required Amount
                        </label>
                        <div className="p-3 bg-dark-primary rounded-lg text-brand-yellow font-mono text-lg">
                          {memexAmount.toLocaleString()} MEMEX
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Transaction ID / Tx Hash
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                              type="text"
                              name="transactionHash"
                              value={formData.transactionHash}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-dark-primary rounded-lg text-brand-blue font-mono text-sm border border-white/10 focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                              placeholder="Enter your transaction hash"
                              required={formData.paymentMade}
                          />
                        </div>
                      </div>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="paymentMade"
                            checked={formData.paymentMade}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-brand-blue rounded border-gray-600 bg-dark-quaternary focus:ring-brand-blue"
                        />
                        <span className="text-gray-300">
                      I confirm that I have made the MEMEX payment
                    </span>
                      </label>
                    </div>

                    <div className="bg-dark-primary rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm">
                        Note: Your store account will be activated after payment verification
                      </p>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {showTerms && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-dark-secondary rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Terms and Conditions</h3>
                <div className="prose prose-invert">
                  <h4 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h4>
                  <p className="text-gray-300 mb-4">
                    By creating an account and using our services, you agree to be bound by these Terms and Conditions.
                  </p>

                  <h4 className="text-lg font-semibold mb-2">2. Store Requirements</h4>
                  <p className="text-gray-300 mb-4">
                    - You must provide accurate and truthful information about your store<br />
                    - You are responsible for maintaining the security of your account<br />
                    - MEMEX payment is required for store activation
                  </p>

                  <h4 className="text-lg font-semibold mb-2">3. Coupon Policies</h4>
                  <p className="text-gray-300 mb-4">
                    - All coupons must be valid and accurate<br />
                    - You are responsible for honoring your posted coupons<br />
                    - Fraudulent or misleading coupons are prohibited
                  </p>

                  <h4 className="text-lg font-semibold mb-2">4. Payment Terms</h4>
                  <p className="text-gray-300 mb-4">
                    - MEMEX payments are non-refundable<br />
                    - Store activation is subject to payment verification<br />
                    - Payment amounts may be adjusted with notice
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                      onClick={() => setShowTerms(false)}
                      className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-purple transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default Auth;