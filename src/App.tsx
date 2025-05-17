import React, { useEffect, useState, useRef } from 'react';
import { Plus, X, Check, Loader2, Lock, Home, User, Settings, Eye, EyeOff, Copy, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { hashPassword, verifyPassword } from './lib/auth';
import CouponCard from './components/CouponCard';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import QRCode from 'qrcode';
import HomeTab from './components/Home';
import Brands from './components/Brands';
import './styles/coupon-card.css';
import './styles/components/home.css';

interface Coupon {
  id: string;
  title: string;
  code: string;
  fixed_discount?: number;
  percentage_discount?: number;
  validity_date?: string | null;
  memex_payment?: boolean;
  description?: string;
  image_url?: string;
  website_link?: string;
  category?: string;
  country: string;
  approved?: boolean;
  user_id?: string;
  brand?: string;
  helpful_votes?: number;
  unhelpful_votes?: number;
}

interface UserData {
  id: string;
  telegram_username: string;
  first_name: string;
  last_name: string;
  country: string;
  memex_payment?: boolean;
  payment_made?: boolean;
  payment_method?: string;
  preferred_currency?: string;
  isAdmin?: boolean;
  store_name?: string;
  brand_description?: string;
  brand_website?: string;
  brand_logo?: string;
}

const categories = [
  'Food', 'Electronics', 'Clothing', 'Travel', 'Home & Garden', 'Beauty', 'Sports & Outdoors',
  'Books', 'Movies & Music', 'Toys & Games', 'Health & Personal Care', 'Automotive', 'Baby',
  'Pet Supplies', 'Office Supplies', 'School Supplies', 'Arts & Crafts', 'Industrial & Scientific',
  'Crypto','Casino', 'Other'
];

const countries = [
  'All Countries', 'USA', 'Canada', 'UK', 'Germany', 'France', 'Turkey', 'Australia', 'Japan', 'China', 'India',
  'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'Saudi Arabia',
  'United Arab Emirates', 'Singapore', 'South Korea', 'Argentina', 'Colombia', 'Peru', 'Chile',
  'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece', 'Poland', 'Hungary', 'Czech Republic',
  'Romania', 'Ukraine', 'Vietnam', 'Thailand', 'Indonesia', 'Malaysia', 'Philippines',
  'New Zealand', 'Other'
];

function App() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    fixed_discount: 0,
    percentage_discount: 0,
    validity_date: '',
    memex_payment: false,
    description: '',
    image_url: '',
    website_link: '',
    category: '',
    country: '',
    brand: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    telegramUsername: '',
    storeName: '',
    brandDescription: '',
    brandWebsite: '',
    brand_logo: ''
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [showMemberList, setShowMemberList] = useState(false);
  const [memberList, setMemberList] = useState<UserData[]>([]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    telegramUsername: '',
  });
  const [featuredCoupons, setFeaturedCoupons] = useState<Coupon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage] = useState(18);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

 

  const isValidUUID = (uuid: string) => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setActiveTab('home');
      if (userData.isAdmin) {
        setIsAdmin(true);
      }
    }

    fetchCoupons();
    fetchMemberCount();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    } else {
      setImagePreview(null);
    }
  }, [formData.image_url]);

  useEffect(() => {
    if (user) {
      fetchUserCoupons();
      setProfileFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        country: user.country || '',
        telegramUsername: user.telegram_username || '',
        storeName: user.store_name || '',
        brandDescription: user.brand_description || '',
        brandWebsite: user.brand_website || '',
        brand_logo: user.brand_logo || ''
      });
    }
  }, [user]);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);

      const memexCoupons = data?.filter(coupon => coupon.approved && coupon.memex_payment) || [];
      const otherCoupons = data?.filter(coupon => coupon.approved && !coupon.memex_payment) || [];
      setFeaturedCoupons([...memexCoupons, ...otherCoupons]);
    } catch (error: any) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCoupons = async () => {
    if (!user?.id) {
      setUserCoupons([]);
      return;
    }
    
    try {
      const query = supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!user.isAdmin) {
        query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUserCoupons(data || []);
    } catch (error: any) {
      console.error('Error fetching user coupons:', error);
      toast.error('Failed to load user coupons');
    }
  };

  const fetchMemberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('custom_users')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setMemberCount(count || 0);
    } catch (error: any) {
      toast.error('Failed to load member count');
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const submissionData = {
      title: formData.title,
      code: formData.code,
      description: formData.description || null,
      image_url: formData.image_url || null,
      website_link: formData.website_link || null,
      fixed_discount: formData.fixed_discount || null,
      percentage_discount: formData.percentage_discount || null,
      validity_date: formData.validity_date ? new Date(formData.validity_date).toISOString() : null,
      memex_payment: formData.memex_payment || false,
      category: formData.category || 'Uncategorized',
      country: formData.country,
      brand: formData.brand || 'MemeX', // Brand için default değer ekleyelim
      user_id: user?.id,
      approved: false
    };

    const { data, error } = await supabase
      .from('coupons')
      .insert([submissionData]);

    if (error) throw error;

    toast.success('Kupon başarıyla eklendi');
    setFormData({
      title: '',
      code: '',
      fixed_discount: 0,
      percentage_discount: 0,
      validity_date: '',
      memex_payment: false,
      description: '',
      image_url: '',
      website_link: '',
      category: '',
      country: '',
      brand: ''
    });
    fetchCoupons();
    fetchUserCoupons();
    setShowAddCoupon(false);
  } catch (error: any) {
    console.error('Kupon eklenirken hata:', error);
    toast.error('Kupon eklenemedi: ' + error.message);
  }
};

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async () => {
    if (!user) {
      toast.error('User not found');
      return;
    }

    if (!isValidUUID(user.id)) {
      toast.error('Invalid user ID format');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('custom_users')
        .update({
          store_name: profileFormData.storeName,
          brand_description: profileFormData.brandDescription,
          brand_website: profileFormData.brandWebsite,
          country: profileFormData.country,
          telegram_username: profileFormData.telegramUsername,
          brand_logo: profileFormData.brand_logo
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const { data: updatedUserData, error: fetchError } = await supabase
        .from('custom_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!updatedUserData) {
        throw new Error('User not found after update');
      }

      const updatedUser = {
        ...user,
        store_name: updatedUserData.store_name,
        brand_description: updatedUserData.brand_description,
        brand_website: updatedUserData.brand_website,
        country: updatedUserData.country,
        telegram_username: updatedUserData.telegram_username,
        brand_logo: updatedUserData.brand_logo
      };

      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setShowEditProfile(false);
      toast.success('Profile updated successfully');

    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAdmin(false);
    setActiveTab('home');
    toast.success('Successfully logged out');
  };

  const handleSignIn = async (telegramUsername: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .eq('telegram_username', telegramUsername)
        .maybeSingle();

      if (error) {
        toast.error('Error finding user');
        return;
      }

      if (!data) {
        toast.error('User not found');
        return;
      }

      const isPasswordValid = await verifyPassword(password, data.password_hash);

      if (!isPasswordValid) {
        toast.error('Incorrect password');
        return;
      }

      if (!isValidUUID(data.id)) {
        toast.error('Invalid user ID format in database');
        return;
      }

      const userData = {
        id: data.id,
        telegram_username: data.telegram_username,
        first_name: data.first_name,
        last_name: data.last_name,
        country: data.country,
        payment_made: data.payment_made,
        payment_method: data.payment_method,
        store_name: data.store_name,
        brand_description: data.brand_description,
        brand_website: data.brand_website,
        brand_logo: data.brand_logo,
        isAdmin: data.is_admin || false
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      if (userData.isAdmin) {
        setIsAdmin(true);
      }
      toast.success('Successfully logged in');
      setActiveTab('profile');
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary py-8 text-dark-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img
              src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memexlogo-Photoroom.png"
              alt="MemeX Logo"
              className="h-12 w-auto mr-4 cursor-pointer"
              onClick={() => setActiveTab('home')}
            />
            <span className="text-white font-bold text-lg">MemeX Coupon</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
            >
              <Home className="w-5 h-5 mr-1" />
              Home
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`nav-button ${activeTab === 'brands' ? 'active' : ''}`}
            >
              <i className="w-5 h-5 mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.25 6.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5zM21 12.75a.75.75 0 010 1.5H3a.75.75 0 010-1.5h18zM17.25 18.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5z" />
                </svg>
              </i>
              Brands
            </button>

            {user ? (
              <button
                onClick={() => setActiveTab('profile')}
                className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User className="w-5 h-5 mr-1" />
                Profile
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('loginRegister')}
                className={`nav-button ${activeTab === 'loginRegister' ? 'active' : ''}`}
              >
                <Lock className="w-5 h-5 mr-1" />
                Login/Register
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`}
              >
                <Settings className="w-5 h-5 mr-1" />
                Admin
              </button>
            )}

            {user && (
              <button
                className="logout-button"
                onClick={handleSignOut}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 w-full bg-dark-secondary py-2 px-4 z-50">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveTab('home')}
              className={`mobile-nav-button ${activeTab === 'home' ? 'active' : ''}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`mobile-nav-button ${activeTab === 'brands' ? 'active' : ''}`}
            >
              <i className="w-5 h-5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.25 6.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5zM21 12.75a.75.75 0 010 1.5H3a.75.75 0 010-1.5h18zM17.25 18.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5z" />
                </svg>
              </i>
              <span className="text-xs">Brands</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`mobile-nav-button ${activeTab === 'profile' ? 'active' : ''}`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs">Profile</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`mobile-nav-button ${activeTab === 'admin' ? 'active' : ''}`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-xs">Admin</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setActiveTab('loginRegister')}
                className={`mobile-nav-button ${activeTab === 'loginRegister' ? 'active' : ''}`}
              >
                <Lock className="w-5 h-5" />
                <span className="text-xs">Login</span>
              </button>
            )}

            {user && (
              <button
                onClick={handleSignOut}
                className="mobile-nav-button"
              >
                <X className="w-5 h-5" />
                <span className="text-xs">Logout</span>
              </button>
            )}
          </div>
        </div>

        <div className="pb-16 md:pb-0">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'loginRegister' && (
            <Auth type="signIn" setActiveTab={setActiveTab} setUser={setUser} setIsAdmin={setIsAdmin} />
          )}
          {activeTab === 'brands' && <Brands />}
          {activeTab === 'admin' && isAdmin && (
            <AdminPanel
              coupons={coupons}
              loading={loading}
              editingId={editingId}
              formData={formData}
              toggleApprove={async (id: string, currentApprovalStatus: boolean) => {
                try {
                  const { error } = await supabase
                    .from('coupons')
                    .update({ approved: !currentApprovalStatus })
                    .eq('id', id);

                  if (error) throw error;
                  toast.success(`Coupon ${!currentApprovalStatus ? 'approved' : 'unapproved'}`);
                  fetchCoupons();
                } catch (error: any) {
                  toast.error('Failed to update approval status');
                }
              }}
              startEditing={(coupon: any) => {
                setEditingId(coupon.id);
                setFormData({
                  title: coupon.title,
                  code: coupon.code,
                  fixed_discount: coupon.fixed_discount || 0,
                  percentage_discount: coupon.percentage_discount || 0,
                  validity_date: coupon.validity_date || '',
                  memex_payment: coupon.memex_payment || false,
                  description: coupon.description || '',
                  image_url: coupon.image_url || '',
                  website_link: coupon.website_link || '',
                  category: coupon.category || '',
                  country: coupon.country,
                  brand: coupon.brand || ''
                });
              }}
              handleDelete={async (id: string) => {
                try {
                  const { error } = await supabase
                    .from('coupons')
                    .delete()
                    .eq('id', id);

                  if (error) throw error;
                  toast.success('Coupon deleted successfully');
                  fetchCoupons();
                } catch (error: any) {
                  toast.error('Failed to delete coupon');
                }
              }}
              handleInputChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => {
                const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
                setFormData({ ...formData, [name]: value });
              }}
              handleSave={async (id: string) => {
                try {
                  const { error } = await supabase
                    .from('coupons')
                    .update(formData)
                    .eq('id', id);

                  if (error) throw error;
                  toast.success('Changes saved successfully');
                  setEditingId(null);
                  fetchCoupons();
                } catch (error: any) {
                  toast.error('Failed to save changes');
                }
              }}
              handleCancel={() => {
                setEditingId(null);
                setFormData({
                  title: '',
                  code: '',
                  fixed_discount: 0,
                  percentage_discount: 0,
                  validity_date: '',
                  memex_payment: false,
                  description: '',
                  image_url: '',
                  website_link: '',
                  category: '',
                  country: '',
                  brand: ''
                });
              }}
              memberCount={memberCount}
            />
          )}
          {activeTab === 'profile' && user && (
            <Profile
              user={user}
              userCoupons={userCoupons}
              showEditProfile={showEditProfile}
              profileFormData={profileFormData}
              countries={countries}
              handleProfileEdit={() => setShowEditProfile(true)}
              handleProfileFormChange={handleProfileFormChange}
              handleProfileUpdate={handleProfileUpdate}
              setShowEditProfile={setShowEditProfile}
              showAddCoupon={showAddCoupon}
              formData={formData}
              categories={categories}
              countriesList={countries}
              editingId={editingId}
              handleSubmit={handleSubmit}
              handleEdit={async (e: React.FormEvent, id: string) => {
                e.preventDefault();
                try {
                  const { error } = await supabase
                    .from('coupons')
                    .update(formData)
                    .eq('id', id);

                  if (error) throw error;
                  toast.success('Coupon updated successfully');
                  setEditingId(null);
                  fetchCoupons();
                  fetchUserCoupons();
                } catch (error: any) {
                  toast.error('Failed to update coupon');
                }
              }}
              handleInputChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => {
                const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
                setFormData({ ...formData, [name]: value });
              }}
              handleSave={async (id: string) => {
                try {
                  const { error } = await supabase
                    .from('coupons')
                    .update(formData)
                    .eq('id', id);

                  if (error) throw error;
                  toast.success('Changes saved successfully');
                  setEditingId(null);
                  fetchCoupons();
                  fetchUserCoupons();
                } catch (error: any) {
                  toast.error('Failed to save changes');
                }
              }}
              setShowAddCoupon={setShowAddCoupon}
              startEditing={(coupon: any) => {
                setEditingId(coupon.id);
                setFormData({
                  title: coupon.title,
                  code: coupon.code,
                  fixed_discount: coupon.fixed_discount || 0,
                  percentage_discount: coupon.percentage_discount || 0,
                  validity_date: coupon.validity_date || '',
                  memex_payment: coupon.memex_payment || false,
                  description: coupon.description || '',
                  image_url: coupon.image_url || '',
                  website_link: coupon.website_link || '',
                  category: coupon.category || '',
                  country: coupon.country,
                  brand: coupon.brand || ''
                });
              }}
              handleDelete={async (id: string) => {
                try {
                  const { error } = await supabase
                    .from('coupons')
                    .delete()
                    .eq('id', id);

                  if (error) throw error;
                  toast.success('Coupon deleted successfully');
                  fetchCoupons();
                  fetchUserCoupons();
                } catch (error: any) {
                  toast.error('Failed to delete coupon');
                }
              }}
              handleCancel={() => {
                setEditingId(null);
                setFormData({
                  title: '',
                  code: '',
                  fixed_discount: 0,
                  percentage_discount: 0,
                  validity_date: '',
                  memex_payment: false,
                  description: '',
                  image_url: '',
                  website_link: '',
                  category: '',
                  country: '',
                  brand: ''
                });
              }}
              userCurrency={user.preferred_currency || 'USD'}
              onCurrencyChange={async (currency: string) => {
                try {
                  const { error } = await supabase
                    .from('custom_users')
                    .update({ preferred_currency: currency })
                    .eq('id', user.id);

                  if (error) throw error;

                  const updatedUser = { ...user, preferred_currency: currency };
                  setUser(updatedUser);
                  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                  toast.success('Currency preference updated');
                } catch (error) {
                  toast.error('Failed to update currency preference');
                }
              }}
            />
          )}
        </div>

        <footer className="bg-dark-secondary text-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} MemeX. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Privacy Policy</a>
            </div>
          </div>
        </footer>

        {showScrollToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-4 bg-dark-secondary text-white p-3 rounded-full shadow-lg hover:bg-dark-tertiary transition-colors duration-300 z-50"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}

        <Toaster position="bottom-center" />
      </div>
    </div>
  );
}

export default App;