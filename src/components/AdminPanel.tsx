import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Plus, X, Search, Filter, Trash2, Edit, Check, Lock as LockIcon, Settings, Package, Users, Eye, EyeOff, ChevronDown, Star } from 'lucide-react';
import AddCouponForm from './AddCouponForm';
import '../styles/components/admin.css';

interface User {
  id: string;
  email: string;
  password: string;
  store_name: string;
  country: string;
  payment_verified: boolean;
  payment_made: boolean;
  is_admin: boolean;
  brand_description?: string;
  brand_website?: string;
  transaction_hash?: string;
}

interface PasswordReset {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface AppSettings {
  memex_amount: number;
  memex_address: string;
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'stores' | 'coupons' | 'featured' | 'resets' | 'settings'>('stores');
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [passwordResets, setPasswordResets] = useState<PasswordReset[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    memex_amount: 50000000,
    memex_address: 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP'
  });

  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [couponSearchTerm, setCouponSearchTerm] = useState('');
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);
  const [featuredCoupons, setFeaturedCoupons] = useState<any[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');
  const [user, setUser] = useState<{ id: string } | null>(null);

  const [statistics, setStatistics] = useState({
    totalStores: 0,
    activeStores: 0,
    totalCoupons: 0,
    pendingResets: 0
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (activeTab === 'featured') {
      fetchFeaturedCoupons();
    }
  }, [activeTab]);

  const loadTabData = async (tab: string) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'stores':
          await fetchUsers();
          break;
        case 'coupons':
          await fetchCoupons();
          break;
        case 'resets':
          await fetchPasswordResets();
          break;
        case 'settings':
          await fetchAppSettings();
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
      toast.error(`Failed to load ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const [usersData, couponsData, resetsData] = await Promise.all([
        supabase.from('custom_users').select('*'),
        supabase.from('coupons').select('*'),
        supabase.from('password_reset_requests').select('*').eq('status', 'pending')
      ]);

      setStatistics({
        totalStores: usersData.data?.length || 0,
        activeStores: usersData.data?.filter(u => u.payment_verified).length || 0,
        totalCoupons: couponsData.data?.length || 0,
        pendingResets: resetsData.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
          .from('coupons')
          .select('*, custom_users(store_name)')
          .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    }
  };

  const fetchFeaturedCoupons = async () => {
    setLoading(true);
    try {
      const [featuredResponse, availableResponse] = await Promise.all([
        supabase
            .from('coupons')
            .select('*, custom_users(store_name)')
            .eq('is_featured', true)
            .order('featured_order', { ascending: true }),
        supabase
            .from('coupons')
            .select('*, custom_users(store_name)')
            .eq('approved', true)
            .eq('is_featured', false)
      ]);

      if (featuredResponse.error) throw featuredResponse.error;
      if (availableResponse.error) throw availableResponse.error;

      setFeaturedCoupons(featuredResponse.data || []);
      setAvailableCoupons(availableResponse.data || []);
    } catch (error) {
      console.error('Error fetching featured coupons:', error);
      toast.error('Failed to load featured coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchPasswordResets = async () => {
    try {
      const { data, error } = await supabase
          .from('password_reset_requests')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) throw error;
      setPasswordResets(data || []);
    } catch (error) {
      console.error('Error fetching password resets:', error);
      toast.error('Failed to load password resets');
    }
  };

  const fetchAppSettings = async () => {
    try {
      const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 1)
          .single();

      if (error) throw error;
      if (data) {
        setAppSettings(data);
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
          .from('custom_users')
          .update({
            payment_verified: newStatus,
            payment_made: newStatus,
            payment_verification_date: newStatus ? new Date().toISOString() : null
          })
          .eq('id', userId);

      if (updateError) throw updateError;

      const { data: updatedUser, error: fetchError } = await supabase
          .from('custom_users')
          .select('*')
          .eq('id', userId)
          .single();

      if (fetchError) throw fetchError;

      setUsers(prevUsers =>
          prevUsers.map(u => u.id === userId ? updatedUser : u)
      );

      setShowStatusDropdown(null);
      toast.success(`Store ${newStatus ? 'activated' : 'deactivated'} successfully`);
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Failed to update store status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
          .from('custom_users')
          .delete()
          .eq('id', userId);

      if (error) throw error;

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success('Store deleted successfully');
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete store');
    }
  };

  const handleApproveCoupon = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
          .from('coupons')
          .update({ approved: !currentStatus })
          .eq('id', couponId);

      if (error) throw error;

      setCoupons(prevCoupons =>
          prevCoupons.map(coupon =>
              coupon.id === couponId
                  ? { ...coupon, approved: !currentStatus }
                  : coupon
          )
      );

      toast.success(`Coupon ${!currentStatus ? 'approved' : 'unapproved'} successfully`);
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
          .from('coupons')
          .delete()
          .eq('id', couponId);

      if (error) throw error;

      setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== couponId));
      toast.success('Coupon deleted successfully');
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handlePasswordReset = async (resetId: string, action: 'approve' | 'reject') => {
    try {
      // First get the reset request details
      const { data: resetRequest, error: requestError } = await supabase
          .from('password_reset_requests')
          .select('email, user_id')
          .eq('id', resetId)
          .single();

      if (requestError || !resetRequest) {
        toast.error('Reset request not found');
        return;
      }

      // Update the request status first
      const { error: updateError } = await supabase
          .from('password_reset_requests')
          .update({
            status: action === 'approve' ? 'approved' : 'rejected',
            handled_at: new Date().toISOString(),
            handled_by: user?.id
          })
          .eq('id', resetId);

      if (updateError) throw updateError;

      // If approving, send the password reset email via Edge Function
      if (action === 'approve') {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: resetRequest.email
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send password reset email');
        }
      }

      toast.success(`Password reset request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      await fetchPasswordResets(); // Refresh the list
      await fetchStatistics(); // Update statistics

    } catch (error: any) {
      console.error('Error handling password reset:', error);
      toast.error(`Failed to ${action} password reset request`);
    }
  };

  const handleAddToFeatured = async () => {
    if (!selectedCoupon) {
      toast.error('Please select a coupon to feature');
      return;
    }

    try {
      const { data: currentFeatured } = await supabase
          .from('coupons')
          .select('featured_order')
          .eq('is_featured', true)
          .order('featured_order', { ascending: false })
          .limit(1)
          .maybeSingle();

      const nextOrder = (currentFeatured?.featured_order || 0) + 1;

      const { error: updateError } = await supabase
          .from('coupons')
          .update({
            is_featured: true,
            featured_order: nextOrder
          })
          .eq('id', selectedCoupon);

      if (updateError) throw updateError;

      await fetchFeaturedCoupons();

      toast.success('Coupon added to featured section');
      setSelectedCoupon('');
    } catch (error) {
      console.error('Error featuring coupon:', error);
      toast.error('Failed to feature coupon');
    }
  };

  const handleRemoveFromFeatured = async (couponId: string) => {
    try {
      const { error: updateError } = await supabase
          .from('coupons')
          .update({
            is_featured: false,
            featured_order: 0
          })
          .eq('id', couponId);

      if (updateError) throw updateError;

      await fetchFeaturedCoupons();

      toast.success('Coupon removed from featured section');
    } catch (error) {
      console.error('Error removing featured coupon:', error);
      toast.error('Failed to remove coupon from featured section');
    }
  };

  const handleReorderFeatured = async (couponId: string, direction: 'up' | 'down') => {
    const currentIndex = featuredCoupons.findIndex(c => c.id === couponId);
    if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === featuredCoupons.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reorderedCoupons = [...featuredCoupons];
    const [movedCoupon] = reorderedCoupons.splice(currentIndex, 1);
    reorderedCoupons.splice(newIndex, 0, movedCoupon);

    try {
      await Promise.all(
          reorderedCoupons.map((coupon, index) =>
              supabase
                  .from('coupons')
                  .update({ featured_order: index })
                  .eq('id', coupon.id)
          )
      );

      await fetchFeaturedCoupons();

      toast.success('Featured order updated');
    } catch (error) {
      console.error('Error reordering featured coupons:', error);
      toast.error('Failed to update featured order');
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
        user.email.toLowerCase().includes(searchLower) ||
        user.store_name?.toLowerCase().includes(searchLower) ||
        user.country.toLowerCase().includes(searchLower)
    );
  });

  const filteredCoupons = coupons.filter(coupon => {
    const searchLower = couponSearchTerm.toLowerCase();
    return (
        coupon.title?.toLowerCase().includes(searchLower) ||
        coupon.code?.toLowerCase().includes(searchLower) ||
        coupon.brand?.toLowerCase().includes(searchLower)
    );
  });

  return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="admin-tabs">
            <button
                onClick={() => setActiveTab('stores')}
                className={`admin-tab ${activeTab === 'stores' ? 'active' : ''}`}
            >
              <Users className="w-5 h-5" />
              Stores
            </button>
            <button
                onClick={() => setActiveTab('coupons')}
                className={`admin-tab ${activeTab === 'coupons' ? 'active' : ''}`}
            >
              <Package className="w-5 h-5" />
              Coupons
            </button>
            <button
                onClick={() => setActiveTab('featured')}
                className={`admin-tab ${activeTab === 'featured' ? 'active' : ''}`}
            >
              <Star className="w-5 h-5" />
              Featured
            </button>
            <button
                onClick={() => setActiveTab('resets')}
                className={`admin-tab ${activeTab === 'resets' ? 'active' : ''}`}
            >
              <LockIcon className="w-5 h-5" />
              Password Resets
              {statistics.pendingResets > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                {statistics.pendingResets}
              </span>
              )}
            </button>
            <button
                onClick={() => setActiveTab('settings')}
                className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Stores</h3>
            <p>{statistics.totalStores}</p>
          </div>
          <div className="stat-card">
            <h3>Active Stores</h3>
            <p>{statistics.activeStores}</p>
          </div>
          <div className="stat-card">
            <h3>Total Coupons</h3>
            <p>{statistics.totalCoupons}</p>
          </div>
        </div>

        {activeTab === 'stores' && (
            <div className="admin-content">
              <div className="admin-toolbar">
                <div className="search-filter">
                  <div className="search-box">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search stores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Store Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Password</th>
                    <th className="px-4 py-2 text-left">Tx Hash</th>
                    <th className="px-4 py-2 text-left">Country</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">Loading...</td>
                      </tr>
                  ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">No stores found</td>
                      </tr>
                  ) : (
                      filteredUsers.map((user) => (
                          <tr key={user.id} className="border-t border-dark-quaternary">
                            <td className="px-4 py-2">{user.store_name}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {showPasswords[user.id] ? user.password : '••••••••'}
                          </span>
                                <button
                                    onClick={() => togglePasswordVisibility(user.id)}
                                    className="p-1 rounded bg-dark-quaternary hover:bg-dark-tertiary"
                                >
                                  {showPasswords[user.id] ? (
                                      <EyeOff size={16} />
                                  ) : (
                                      <Eye size={16} />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {user.transaction_hash ? (
                                  <a
                                      href={`https://electraprotocol.network/omni/transaction/${user.transaction_hash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-brand-blue hover:text-brand-purple transition-colors"
                                  >
                                    {user.transaction_hash.substring(0, 8)}...
                                  </a>
                              ) : (
                                  <span className="text-gray-400">No hash</span>
                              )}
                            </td>
                            <td className="px-4 py-2">{user.country}</td>
                            <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                            user.payment_verified
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.payment_verified ? 'Active' : 'Pending'}
                        </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-2">
                                <div className="relative">
                                  <button
                                      onClick={() => setShowStatusDropdown(showStatusDropdown === user.id ? null : user.id)}
                                      className="p-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center gap-1"
                                  >
                                    <Edit size={16} />
                                    <ChevronDown size={14} />
                                  </button>
                                  {showStatusDropdown === user.id && (
                                      <div className="absolute right-0 mt-1 w-32 bg-dark-tertiary rounded-lg shadow-lg border border-dark-quaternary z-10">
                                        <button
                                            onClick={() => handleStatusChange(user.id, true)}
                                            className="w-full px-4 py-2 text-left hover:bg-dark-quaternary text-green-400 rounded-t-lg"
                                        >
                                          Active
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(user.id, false)}
                                            className="w-full px-4 py-2 text-left hover:bg-dark-quaternary text-yellow-400 rounded-b-lg"
                                        >
                                          Pending
                                        </button>
                                      </div>
                                  )}
                                </div>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    title="Delete Store"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {activeTab === 'coupons' && (
            <div className="admin-content">
              <div className="admin-toolbar">
                <div className="search-filter">
                  <div className="search-box">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search coupons..."
                        value={couponSearchTerm}
                        onChange={(e) => setCouponSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Store</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                  </thead>

                  <tbody>
                  {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">Loading...</td>
                      </tr>
                  ) : filteredCoupons.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">No coupons found</td>
                      </tr>

                  ) : (
                      filteredCoupons.map((coupon) => (
                          <tr key={coupon.id} className="border-t border-dark-quaternary">
                            <td className="px-4 py-2">{coupon.title}</td>
                            <td className="px-4 py-2">{coupon.code}</td>
                            <td className="px-4 py-2">{coupon.custom_users?.store_name}</td>
                            <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                            coupon.approved
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {coupon.approved ? 'Approved' : 'Pending'}
                        </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-2">
                                <button
                                    onClick={() => handleApproveCoupon(coupon.id, coupon.approved)}
                                    className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    title={coupon.approved ? 'Unapprove Coupon' : 'Approve Coupon'}
                                >
                                  {coupon.approved ? <X size={16} /> : <Check size={16} />}
                                </button>
                                <button
                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                    className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    title="Delete Coupon"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {activeTab === 'featured' && (
            <div className="admin-content">
              <div className="glass-card p-8 rounded-xl mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Add Featured Coupon</h2>
                <div className="flex gap-4">
                  <select
                      value={selectedCoupon}
                      onChange={(e) => setSelectedCoupon(e.target.value)}
                      className="flex-1 px-4 py-3 bg-dark-tertiary rounded-lg text-white border border-white/10"
                  >
                    <option value="">Select a coupon to feature</option>
                    {availableCoupons.map((coupon) => (
                        <option key={coupon.id} value={coupon.id}>
                          {coupon.title} - {coupon.custom_users?.store_name}
                        </option>
                    ))}
                  </select>
                  <button
                      onClick={handleAddToFeatured}
                      className="px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-lg
                  hover:opacity-90 transition-all duration-300"
                  >
                    Add to Featured
                  </button>
                </div>
              </div>

              <div className="glass-card p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-6">Featured Coupons</h2>
                <div className="space-y-4">
                  {featuredCoupons.map((coupon, index) => (
                      <div
                          key={coupon.id}
                          className="flex items-center justify-between p-4 bg-dark-tertiary rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{coupon.title}</h3>
                          <p className="text-gray-400">{coupon.custom_users?.store_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                              onClick={() => handleReorderFeatured(coupon.id, 'up')}
                              disabled={index === 0}
                              className="p-2 rounded bg-dark-quaternary hover:bg-dark-tertiary disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                              onClick={() => handleReorderFeatured(coupon.id, 'down')}
                              disabled={index ===
                                  featuredCoupons.length - 1}
                              className="p-2 rounded bg-dark-quaternary hover:bg-dark-tertiary disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                              onClick={() => handleRemoveFromFeatured(coupon.id)}
                              className="p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                  ))}
                  {featuredCoupons.length === 0 && (
                      <p className="text-center text-gray-400 py-4">No featured coupons yet</p>
                  )}
                </div>
              </div>
            </div>
        )}

        {activeTab === 'resets' && (
            <div className="admin-content">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Requested At</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">Loading...</td>
                      </tr>
                  ) : passwordResets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">No password reset requests</td>
                      </tr>
                  ) : (
                      passwordResets.map((reset) => (
                          <tr key={reset.id} className="border-t border-dark-quaternary">
                            <td className="px-4 py-2">{reset.email}</td>
                            <td className="px-4 py-2">
                              {new Date(reset.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                            reset.status === 'approved'
                                ? 'bg-green-500/20 text-green-400'
                                : reset.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {reset.status.charAt(0).toUpperCase() + reset.status.slice(1)}
                        </span>
                            </td>

                            <td className="px-4 py-2">
                              {reset.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePasswordReset(reset.id, 'approve')}
                                        className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                        title="Approve Request"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => handlePasswordReset(reset.id, 'reject')}
                                        className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                        title="Reject Request"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                              )}
                            </td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="admin-content">
              <div className="glass-card p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-6">MEMEX Payment Settings</h2>
                {settingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Required MEMEX Amount
                        </label>
                        <input
                            type="number"
                            value={appSettings.memex_amount}
                            onChange={(e) => setAppSettings(prev => ({
                              ...prev,
                              memex_amount: parseInt(e.target.value)
                            }))}
                            className="w-full px-4 py-3 bg-dark-tertiary rounded-lg text-white border border-white/10"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          MEMEX Payment Address
                        </label>
                        <input
                            type="text"
                            value={appSettings.memex_address}
                            onChange={(e) => setAppSettings(prev => ({
                              ...prev,
                              memex_address: e.target.value
                            }))}
                            className="w-full px-4 py-3 bg-dark-tertiary rounded-lg text-white border border-white/10"
                        />
                      </div>

                      <button
                          onClick={async () => {
                            try {
                              setSettingsLoading(true);
                              const { error } = await supabase
                                  .from('app_settings')
                                  .update({
                                    memex_amount: appSettings.memex_amount,
                                    memex_address: appSettings.memex_address
                                  })
                                  .eq('id', 1);

                              if (error) throw error;
                              toast.success('Settings updated successfully');
                            } catch (error) {
                              console.error('Error updating settings:', error);
                              toast.error('Failed to update settings');
                            } finally {
                              setSettingsLoading(false);
                            }
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-lg
                    hover:opacity-90 transition-all duration-300"
                      >
                        Save Settings
                      </button>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminPanel;