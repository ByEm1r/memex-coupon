import React, { useEffect, useState, useRef } from 'react';
import { Search, MapPin, Package, Sparkles, ChevronLeft, ChevronRight, Building2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import CouponCard from './CouponCard';
import '../styles/components/home.css';

interface Coupon {
  id: string;
  title: string;
  code: string;
  description?: string;
  image_url?: string;
  website_link?: string;
  fixed_discount?: number;
  percentage_discount?: number;
  validity_date?: string;
  memex_payment: boolean;
  helpful_votes: number;
  unhelpful_votes: number;
  category?: string;
  country: string;
  brand?: string;
}

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showcaseCoupons, setShowcaseCoupons] = useState<Coupon[]>([]);
  const [regularCoupons, setRegularCoupons] = useState<Coupon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  const showcaseLimit = 9;
  const regularPerPage = 18;

  const scrollShowcase = (direction: 'left' | 'right') => {
    if (!showcaseRef.current) return;

    const scrollAmount = showcaseRef.current.clientWidth;
    const newScrollPosition = showcaseRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    showcaseRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const { data: featured, error: featuredError } = await supabase
          .from('coupons')
          .select('*, custom_users(store_name)')
          .eq('is_featured', true)
          .eq('approved', true)
          .order('featured_order', { ascending: true });

      if (featuredError) throw featuredError;
      setShowcaseCoupons(featured || []);

      const { data: regular, error: regularError } = await supabase
          .from('coupons')
          .select('*, custom_users(store_name)')
          .eq('approved', true)
          .eq('is_featured', false)
          .order('created_at', { ascending: false });

      if (regularError) throw regularError;
      setRegularCoupons(regular || []);

      const brands = Array.from(new Set(regular?.map(coupon => coupon.brand).filter(Boolean) || []));
      setAvailableBrands(brands.sort());

    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegularCoupons = React.useMemo(() =>
          regularCoupons.filter(coupon =>
              (coupon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (selectedCategory === '' || coupon.category === selectedCategory) &&
              (selectedCountry === '' || coupon.country === selectedCountry) &&
              (selectedBrand === '' || coupon.brand === selectedBrand)
          ),
      [regularCoupons, searchTerm, selectedCategory, selectedCountry, selectedBrand]
  );

  const totalPages = Math.ceil(filteredRegularCoupons.length / regularPerPage);
  const currentRegularCoupons = filteredRegularCoupons.slice(
      (currentPage - 1) * regularPerPage,
      currentPage * regularPerPage
  );

  return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="hero-banner">
          <div className="hero-content">
            <h1 className="hero-title">
              Exclusive MEMEX Deals & Discounts
            </h1>
            <p className="hero-subtitle">
              Discover amazing deals and save big with MEMEX payment options
            </p>
          </div>
        </div>

        {showcaseCoupons.length > 0 && (
            <div className="showcase-section">
              <div className="showcase-header">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-brand-yellow" />
                  <div>
                    <h2 className="text-2xl font-bold heading-gradient">Featured Deals</h2>
                    <p className="text-gray-400">Special offers and exclusive discounts</p>
                  </div>
                </div>
              </div>

              <div className="showcase-container">
                <button
                    onClick={() => scrollShowcase('left')}
                    className="showcase-nav-button left"
                    aria-label="Previous deals"
                >
                  <ChevronLeft size={24} />
                </button>

                <div ref={showcaseRef} className="showcase-grid">
                  {showcaseCoupons.map((coupon) => (
                      <div key={coupon.id} className="showcase-item">
                        <CouponCard coupon={coupon} user={user} />
                      </div>
                  ))}
                </div>

                <button
                    onClick={() => scrollShowcase('right')}
                    className="showcase-nav-button right"
                    aria-label="Next deals"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
        )}

        <div className="filters-section">
          <div className="search-container">
            <Search className="search-icon" />
            <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
          </div>

          <div className="filter-container">
            <div className="filter-group">
              <Package className="filter-icon" />
              <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
              >
                <option value="">All Categories</option>
                {[
                  'Electronics', 'Fashion', 'Food', 'Travel', 'Entertainment',
                  'Home & Garden', 'Sports', 'Beauty', 'Books', 'Other'
                ].map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <MapPin className="filter-icon" />
              <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="filter-select"
              >
                <option value="">All Countries</option>
                {[
                  'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France',
                  'Japan', 'China', 'India', 'Brazil', 'Other'
                ].map(country => (
                    <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Building2 className="filter-icon" />
              <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="filter-select"
              >
                <option value="">All Brands</option>
                {availableBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="regular-coupons-section">
          <h2 className="text-2xl font-bold heading-gradient mb-6">All Coupons</h2>

          {loading ? (
              <div className="loading-spinner" />
          ) : currentRegularCoupons.length === 0 ? (
              <div className="no-results">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No coupons found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
          ) : (
              <>
                <div className="regular-coupons-grid">
                  {currentRegularCoupons.map((coupon) => (
                      <div key={coupon.id} className="regular-coupon-item">
                        <CouponCard coupon={coupon} user={user} />
                      </div>
                  ))}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                      {Array.from({ length: totalPages }).map((_, index) => (
                          <button
                              key={index}
                              onClick={() => setCurrentPage(index + 1)}
                              className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                          >
                            {index + 1}
                          </button>
                      ))}
                    </div>
                )}
              </>
          )}
        </div>

        <div className="bg-dark-secondary/80 backdrop-blur-sm rounded-xl p-8 border border-white/10 shadow-lg mt-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-yellow/20 rounded-full">
              <Mail className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Need Help?</h2>
              <p className="text-gray-400">We're here to assist you with any questions or concerns</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-dark-tertiary/50 p-6 rounded-lg">
            <Mail className="w-5 h-5 text-brand-yellow" />
            <a
                href="mailto:coupon@memextoken.org"
                className="text-brand-yellow hover:text-brand-orange transition-colors font-medium"
            >
              coupon@memextoken.org
            </a>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Available 24/7</span>
          </div>
        </div>
      </div>
  );
};

export default React.memo(Home);