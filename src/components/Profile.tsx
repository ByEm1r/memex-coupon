import React, { useState, useEffect } from 'react';
import { User, Package, Clock, Plus, Edit, Trash2, ExternalLink, Globe, Building2, MapPin, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import AddCouponForm from './AddCouponForm';
import '../styles/components/profile.css';

interface ProfileProps {
  user: {
    id: string;
    email: string;
    store_name: string;
    country: string;
    preferred_currency?: string;
    brand_description?: string;
    brand_website?: string;
    brand_logo?: string;
    payment_verified: boolean;
    payment_made: boolean;
    is_admin: boolean;
  };
  userCoupons: any[];
  showEditProfile: boolean;
  profileFormData: any;
  countries: string[];
  handleProfileEdit: () => void;
  handleProfileFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleProfileUpdate: () => void;
  setShowEditProfile: (show: boolean) => void;
  showAddCoupon: boolean;
  formData: any;
  categories: string[];
  countriesList: string[];
  editingId: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (e: React.FormEvent, id: string) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => void;
  handleSave: (id: string) => Promise<void>;
  setShowAddCoupon: (show: boolean) => void;
  startEditing: (coupon: any) => void;
  handleDelete: (id: string) => Promise<void>;
  handleCancel: () => void;
  userCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const Profile: React.FC<ProfileProps> = ({
  user,
  userCoupons,
  showEditProfile,
  profileFormData,
  countries,
  handleProfileEdit,
  handleProfileFormChange,
  handleProfileUpdate,
  setShowEditProfile,
  showAddCoupon,
  formData,
  categories,
  countriesList,
  editingId,
  handleSubmit,
  handleEdit,
  handleInputChange,
  handleSave,
  setShowAddCoupon,
  startEditing,
  handleDelete,
  handleCancel,
  userCurrency,
  onCurrencyChange,
}) => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [statistics, setStatistics] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0
  });
  const [showEditCoupon, setShowEditCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [couponView, setCouponView] = useState<'active' | 'expired'>('active');

  useEffect(() => {
    fetchStatistics();
  }, [user.id, userCoupons]);

  const fetchStatistics = async () => {
    try {
      const now = new Date();
      const activeCoupons = userCoupons.filter(coupon => 
        !coupon.validity_date || new Date(coupon.validity_date) > now
      );
      const expiredCoupons = userCoupons.filter(coupon => 
        coupon.validity_date && new Date(coupon.validity_date) <= now
      );

      setStatistics({
        totalCoupons: userCoupons.length,
        activeCoupons: activeCoupons.length,
        expiredCoupons: expiredCoupons.length
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent, submissionData: any) => {
    e.preventDefault();
    try {
      console.log('Submitting coupon data:', submissionData);

      const { data, error } = await supabase
        .from('coupons')
        .insert([{
          ...submissionData,
          user_id: user.id,
          approved: false,
          brand: submissionData.brand || user.store_name
        }])
        .select();

      if (error) throw error;

      toast.success('Coupon added successfully');
      setShowAddCoupon(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error adding coupon:', error);
      toast.error('Failed to add coupon: ' + error.message);
    }
  };

  const canAddCoupons = user.is_admin || (user.payment_made && user.payment_verified);

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setShowEditCoupon(true);
  };

  const getTimeLeft = (validityDate: string) => {
    const end = new Date(validityDate).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    if (distance < 0) return 'Expired';

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const renderCoupons = () => {
    const now = new Date();
    const filteredCoupons = userCoupons.filter(coupon => {
      const isExpired = coupon.validity_date && new Date(coupon.validity_date) <= now;
      return couponView === 'expired' ? isExpired : !isExpired;
    });

    if (filteredCoupons.length === 0) {
      return (
        <div className="empty-state">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {couponView === 'active' ? 'No Active Coupons' : 'No Expired Coupons'}
          </h3>
          {couponView === 'active' && canAddCoupons && (
            <button onClick={() => setShowAddCoupon(true)} className="btn btn-primary mt-4">
              <Plus size={18} />
              Add Your First Coupon
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="content-grid">
        {filteredCoupons.map((coupon, index) => (
          <div key={coupon.id} className="coupon-card" style={{animationDelay: `${index * 100}ms`}}>
            <div className="relative h-40 bg-gray-800">
              {coupon.image_url ? (
                <img 
                  src={coupon.image_url} 
                  alt={coupon.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-tertiary to-dark-quaternary">
                  <Package size={48} className="text-gray-500" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button 
                  onClick={() => handleEditCoupon(coupon)}
                  className="p-2 bg-dark-secondary/80 rounded-full hover:bg-dark-tertiary transition-colors"
                  title="Edit coupon"
                >
                  <Edit size={16} className="text-white" />
                </button>
                <button 
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2 bg-dark-secondary/80 rounded-full hover:bg-red-900/80 transition-colors"
                  title="Delete coupon"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
              {coupon.validity_date && (
                <div className="absolute bottom-2 right-2 bg-dark-secondary/90 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Clock size={14} />
                  <span>{getTimeLeft(coupon.validity_date)}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-blue/20 text-brand-blue">
                  {coupon.category || 'Uncategorized'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-purple/20 text-brand-purple">
                  {coupon.country}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-white truncate">{coupon.title}</h3>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">
                  {coupon.validity_date ? (
                    <span>Valid until {new Date(coupon.validity_date).toLocaleDateString()}</span>
                  ) : (
                    <span>No expiration date</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="px-3 py-1 bg-brand-yellow/20 rounded-lg">
                  <span className="text-lg font-bold text-brand-yellow">
                    {coupon.percentage_discount ? `${coupon.percentage_discount}% OFF` : 
                     coupon.fixed_discount ? `${new Intl.NumberFormat('en-US', {
                       style: 'currency',
                       currency: userCurrency
                     }).format(coupon.fixed_discount)} OFF` : 
                     'No discount specified'}
                  </span>
                </div>
                {coupon.website_link && (
                  <a 
                    href={coupon.website_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-blue hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    <span>Visit</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="flex items-center gap-6">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {user.store_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
            </div>
            <div className="profile-details">
              <h1 className="store-name text-3xl font-bold bg-gradient-to-r from-brand-yellow to-brand-orange bg-clip-text text-transparent">
                {user.store_name}
              </h1>
              <div className="profile-meta">
                <p>
                  <Mail size={18} />
                  {user.email}
                </p>
                <p>
                  <MapPin size={18} />
                  {user.country}
                </p>
                {user.brand_website && (
                  <p>
                    <Globe size={18} />
                    <a href={user.brand_website} target="_blank" rel="noopener noreferrer" 
                       className="text-brand-blue hover:text-brand-purple transition-colors">
                      {user.brand_website}
                    </a>
                  </p>
                )}
              </div>
              {user.brand_description && (
                <p className="mt-4 text-gray-300">{user.brand_description}</p>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <button onClick={handleProfileEdit} className="btn btn-primary">
              <Edit size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <Package className="w-8 h-8 mx-auto mb-2 text-brand-blue" />
            <p className="stat-value text-brand-blue">{statistics.totalCoupons}</p>
            <p className="stat-label">Total Coupons</p>
          </div>
          <div className="stat-card">
            <Clock className="w-8 h-8 mx-auto mb-2 text-brand-purple" />
            <p className="stat-value text-brand-purple">{statistics.activeCoupons}</p>
            <p className="stat-label">Active Coupons</p>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <div className="content-card">
          <h2 className="section-title">Edit Your Profile</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }} className="form-container">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <div className="input-wrapper">
                <Building2 className="input-icon" size={18} />
                <input
                  type="text"
                  name="storeName"
                  value={profileFormData.storeName}
                  onChange={handleProfileFormChange}
                  className="input-field"
                  placeholder="Enter your store name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Brand Description</label>
              <textarea
                name="brandDescription"
                value={profileFormData.brandDescription}
                onChange={handleProfileFormChange}
                className="input-field h-24 resize-none"
                placeholder="Describe your brand or store"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Website</label>
              <div className="input-wrapper">
                <Globe className="input-icon" size={18} />
                <input
                  type="url"
                  name="brandWebsite"
                  value={profileFormData.brandWebsite}
                  onChange={handleProfileFormChange}
                  className="input-field"
                  placeholder="https://yourbrand.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Telegram Username</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="text"
                  name="telegramUsername"
                  value={profileFormData.telegramUsername}
                  onChange={handleProfileFormChange}
                  className="input-field"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <select
                name="country"
                value={profileFormData.country}
                onChange={handleProfileFormChange}
                className="input-field"
                required
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={() => setShowEditProfile(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabs-container">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`nav-link flex-1 justify-center ${activeTab === 'coupons' ? 'active' : ''}`}
          >
            <Package size={18} />
            My Coupons
          </button>
        </div>
      </div>

      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="section-title">Your Coupons</h2>
            {canAddCoupons ? (
              <button onClick={() => setShowAddCoupon(true)} className="add-button">
                <Plus size={18} />
                Add New Coupon
              </button>
            ) : (
              <div className="text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg">
                Store activation required to add coupons
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setCouponView('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                couponView === 'active'
                  ? 'bg-brand-blue text-white'
                  : 'bg-dark-tertiary text-gray-400 hover:bg-dark-quaternary'
              }`}
            >
              Active Coupons ({statistics.activeCoupons})
            </button>
            <button
              onClick={() => setCouponView('expired')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                couponView === 'expired'
                  ? 'bg-brand-purple text-white'
                  : 'bg-dark-tertiary text-gray-400 hover:bg-dark-quaternary'
              }`}
            >
              Expired Coupons ({statistics.expiredCoupons})
            </button>
          </div>

          {renderCoupons()}
        </div>
      )}

      {(showAddCoupon || showEditCoupon) && (
        <AddCouponForm
          onSubmit={handleCouponSubmit}
          onClose={() => {
            setShowAddCoupon(false);
            setShowEditCoupon(false);
            setEditingCoupon(null);
            handleCancel();
          }}
          categories={categories}
          countries={countriesList}
          editingCoupon={editingCoupon}
          user={user}
        />
      )}
    </div>
  );
};

export default Profile;