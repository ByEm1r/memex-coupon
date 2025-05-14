import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { MapPin, ExternalLink, Package, Star, ArrowLeft } from 'lucide-react';
import CouponCard from './CouponCard';

interface Brand {
  brand: string;
  coupon_count: number;
  categories: string[];
  countries: string[];
  description?: string;
  website?: string;
  logo_url?: string;
}

interface BrandDetails {
  description: string;
  website: string;
  logo_url: string;
}

const brandDetails: Record<string, BrandDetails> = {
  'Apple': {
    description: 'Apple Inc. is a technology company that designs, develops, and sells consumer electronics, software, and services.',
    website: 'https://www.apple.com',
    logo_url: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  'Samsung': {
    description: 'Samsung is a South Korean multinational manufacturing conglomerate headquartered in Samsung Town, Seoul.',
    website: 'https://www.samsung.com',
    logo_url: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
  // Add more brand details as needed
};

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [nearbyBrands, setNearbyBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brandCoupons, setBrandCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetchBrands();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchBrandCoupons(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('brand, category, country')
        .not('brand', 'is', null)
        .order('brand', { ascending: true });

      if (error) throw error;

      const brandMap = new Map<string, Brand>();
      
      data.forEach((item: any) => {
        if (!item.brand) return;
        
        if (!brandMap.has(item.brand)) {
          brandMap.set(item.brand, {
            brand: item.brand,
            coupon_count: 1,
            categories: [item.category],
            countries: [item.country],
            ...brandDetails[item.brand]
          });
        } else {
          const brand = brandMap.get(item.brand)!;
          brand.coupon_count++;
          if (!brand.categories.includes(item.category)) {
            brand.categories.push(item.category);
          }
          if (!brand.countries.includes(item.country)) {
            brand.countries.push(item.country);
          }
        }
      });

      setBrands(Array.from(brandMap.values()));
    } catch (error: any) {
      toast.error(`Failed to fetch brands: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandCoupons = async (brandName: string) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('brand', brandName)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrandCoupons(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch brand coupons');
    }
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`
          );
          const data = await response.json();
          const country = data.results[0]?.components.country;
          setUserLocation(country);
          
          if (country) {
            const nearby = brands.filter(brand => 
              brand.countries.includes(country)
            );
            setNearbyBrands(nearby);
          }
        } catch (error) {
          console.error('Error getting location:', error);
        }
      });
    }
  };

  return (
    <div className="brands-container p-6">
      {selectedBrand ? (
        <div className="space-y-8">
          <button
            onClick={() => setSelectedBrand(null)}
            className="flex items-center text-brand-blue hover:text-brand-purple transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Brands
          </button>

          <div className="glass-card p-8 rounded-xl">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-xl overflow-hidden">
                <img
                  src={brandDetails[selectedBrand]?.logo_url || 'https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                  alt={selectedBrand}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">{selectedBrand}</h2>
                <p className="text-gray-300 mb-4">
                  {brandDetails[selectedBrand]?.description || `${selectedBrand} offers great deals and discounts on their products and services.`}
                </p>
                {brandDetails[selectedBrand]?.website && (
                  <a
                    href={brandDetails[selectedBrand].website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-brand-blue hover:text-brand-purple transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Available Coupons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">All Brands</h2>

          {userLocation && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <MapPin className="mr-2" />
                Brands Available in Your Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyBrands.map((brand) => (
                  <div
                    key={brand.brand}
                    className="glass-card p-6 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedBrand(brand.brand)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={brand.logo_url || 'https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                          alt={brand.brand}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{brand.brand}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Package className="w-4 h-4" />
                          <span>{brand.coupon_count} coupons</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              brands.map((brand) => (
                <div
                  key={brand.brand}
                  className="glass-card p-6 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => setSelectedBrand(brand.brand)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <img
                        src={brand.logo_url || 'https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                        alt={brand.brand}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{brand.brand}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Package className="w-4 h-4" />
                        <span>{brand.coupon_count} coupons</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {brand.categories.map((category) => (
                        <span key={category} className="px-2 py-1 bg-dark-tertiary rounded-full text-xs text-white">
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {brand.countries.slice(0, 3).map((country) => (
                        <span key={country} className="px-2 py-1 bg-brand-blue/20 rounded-full text-xs text-brand-blue">
                          {country}
                        </span>
                      ))}
                      {brand.countries.length > 3 && (
                        <span className="px-2 py-1 bg-brand-purple/20 rounded-full text-xs text-brand-purple">
                          +{brand.countries.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Brands;