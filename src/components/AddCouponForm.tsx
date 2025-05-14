import React, { useState, useEffect } from 'react';
import { Plus, X, Image, Link, Tag, MapPin, Calendar, Percent, DollarSign, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AddCouponFormProps {
  onSubmit: (e: React.FormEvent, formData: any) => void;
  onClose: () => void;
  categories: string[];
  countries: string[];
  editingCoupon?: any;
  user?: any;
}

const AddCouponForm: React.FC<AddCouponFormProps> = ({
  onSubmit,
  onClose,
  categories,
  countries,
  editingCoupon,
  user
}) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    fixed_discount: '',
    percentage_discount: '',
    validity_date: '',
    memex_payment: false,
    description: '',
    image_url: '',
    website_link: '',
    category: '',
    country: '',
    brand: user?.store_name || '' // Set default brand as store name
  });

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        title: editingCoupon.title || '',
        code: editingCoupon.code || '',
        fixed_discount: editingCoupon.fixed_discount || '',
        percentage_discount: editingCoupon.percentage_discount || '',
        validity_date: editingCoupon.validity_date ? new Date(editingCoupon.validity_date).toISOString().split('T')[0] : '',
        memex_payment: editingCoupon.memex_payment || false,
        description: editingCoupon.description || '',
        image_url: editingCoupon.image_url || '',
        website_link: editingCoupon.website_link || '',
        category: editingCoupon.category || '',
        country: editingCoupon.country || '',
        brand: editingCoupon.brand || user?.store_name || ''
      });

      setDiscountType(editingCoupon.percentage_discount !== null ? 'percentage' : 'fixed');
    }
  }, [editingCoupon, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.code || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Convert discount values to numbers
    const submissionData = {
      ...formData,
      fixed_discount: discountType === 'fixed' ? parseFloat(formData.fixed_discount) : null,
      percentage_discount: discountType === 'percentage' ? parseFloat(formData.percentage_discount) : null,
      validity_date: formData.validity_date ? new Date(formData.validity_date).toISOString() : null,
      brand: formData.brand || user?.store_name, // Ensure brand is set
      user_id: user?.id
    };

    onSubmit(e, submissionData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (discountType === 'percentage') {
      setFormData(prev => ({ ...prev, percentage_discount: value, fixed_discount: '' }));
    } else {
      setFormData(prev => ({ ...prev, fixed_discount: value, percentage_discount: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-secondary rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-yellow to-brand-orange bg-clip-text text-transparent">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-tertiary rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              placeholder="Enter coupon title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              placeholder="Enter coupon code"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Discount Value</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {discountType === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                </span>
                <input
                  type="number"
                  value={discountType === 'percentage' ? formData.percentage_discount : formData.fixed_discount}
                  onChange={handleDiscountChange}
                  className="w-full pl-10 pr-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
                  placeholder={discountType === 'percentage' ? "Enter percentage" : "Enter amount"}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Validity Date</label>
            <input
              type="date"
              name="validity_date"
              value={formData.validity_date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="memex_payment"
                checked={formData.memex_payment}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-white/10 bg-dark-tertiary text-brand-yellow"
              />
              <span className="text-sm font-medium text-gray-300">MEMEX Payment Required</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white h-24 resize-none"
              placeholder="Enter coupon description"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Image URL
              <span className="text-xs text-gray-400 ml-2">
                (Recommended size: 1200x630px or 16:9 ratio)
              </span>
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              placeholder="Enter image URL"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              For best display quality, use images with dimensions 1200x630 pixels or maintain a 16:9 aspect ratio.
              Images will be automatically resized to fit while maintaining aspect ratio.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Website Link</label>
            <input
              type="url"
              name="website_link"
              value={formData.website_link}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              placeholder="Enter website URL"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-tertiary rounded-lg border border-white/10 text-white"
              placeholder="Enter brand name"
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-dark-tertiary text-white rounded-lg hover:bg-dark-quaternary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-lg hover:opacity-90 transition-all duration-300"
            >
              {editingCoupon ? 'Save Changes' : 'Add Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCouponForm;