import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';

interface AddCouponFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
  categories: string[];
  countries: string[];
  imagePreview: string | null;
  editingId: string | null;
  availableBrands?: string[];
}

const AddCouponForm: React.FC<AddCouponFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  handleCancel,
  categories,
  countries,
  imagePreview,
  editingId,
  availableBrands = []
}) => {
  const [startDate, setStartDate] = useState<Date | null>(formData.validity_date ? new Date(formData.validity_date) : null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    formData.percentage_discount ? 'percentage' : 'fixed'
  );
  const [isNewBrand, setIsNewBrand] = useState(false);

  useEffect(() => {
    if (startDate) {
      handleInputChange(
        { target: { value: startDate.toISOString().split('T')[0], name: 'validity_date' } } as any,
        'validity_date'
      );
    }
  }, [startDate, handleInputChange]);

  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiscountType = e.target.value as 'percentage' | 'fixed';
    setDiscountType(newDiscountType);
    
    // Reset both discount values
    handleInputChange({ target: { value: '0', name: 'fixed_discount' } } as any, 'fixed_discount');
    handleInputChange({ target: { value: '0', name: 'percentage_discount' } } as any, 'percentage_discount');
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleInputChange(e, 'brand');
  };

  return (
    <div className="form-container">
      <h2 className="form-title">{editingId ? 'Edit Coupon' : 'Add Coupon'}</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="col-span-2">
          <label className="form-label">Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange(e, 'title')}
            className="form-input"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="form-label">Code:</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleInputChange(e, 'code')}
            className="form-input"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="form-label">Discount Type:</label>
          <select
            value={discountType}
            onChange={handleDiscountTypeChange}
            className="form-input"
            required
          >
            <option value="percentage">Percentage Discount</option>
            <option value="fixed">Fixed Amount Discount</option>
          </select>
        </div>

        {discountType === 'percentage' ? (
          <div className="col-span-2">
            <label className="form-label">Discount Percentage:</label>
            <input
              type="number"
              value={formData.percentage_discount}
              onChange={(e) => handleInputChange(e, 'percentage_discount')}
              className="form-input"
              min="0"
              max="100"
              required
            />
          </div>
        ) : (
          <div className="col-span-2">
            <label className="form-label">Fixed Discount Amount:</label>
            <input
              type="number"
              value={formData.fixed_discount}
              onChange={(e) => handleInputChange(e, 'fixed_discount')}
              className="form-input"
              min="0"
              required
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="form-label">Validity Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-input"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="form-label">Memex Payment:</label>
          <select
            value={formData.memex_payment}
            onChange={(e) => handleInputChange(e, 'memex_payment')}
            className="form-input"
            required
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="form-label">Description:</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange(e, 'description')}
            className="form-input"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="form-label">Image URL:</label>
          <input
            type="text"
            value={formData.image_url}
            onChange={(e) => handleInputChange(e, 'image_url')}
            className="form-input"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="form-label">Website Link:</label>
          <input
            type="text"
            value={formData.website_link}
            onChange={(e) => handleInputChange(e, 'website_link')}
            className="form-input"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="form-label">Category:</label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange(e, 'category')}
            className="form-input"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="form-label">Country:</label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange(e, 'country')}
            className="form-input"
            required
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="form-label">Brand:</label>
          {isNewBrand ? (
            <input
              type="text"
              value={formData.brand || ''}
              onChange={handleBrandChange}
              className="form-input"
            />
          ) : (
            <select
              value={formData.brand}
              onChange={handleBrandChange}
              className="form-input"
            >
              <option value="">Select Brand</option>
              {availableBrands?.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
              <option value="new_brand">Add New Brand</option>
            </select>
          )}
        </div>

        {!isNewBrand && (
          <div className="col-span-2">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setIsNewBrand(true)}
            >
              Or enter a new brand
            </button>
          </div>
        )}
        
        <div className="col-span-2 flex justify-end gap-4">
          <button
            type="submit"
            className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
          >
            {editingId ? 'Save Changes' : 'Add Coupon'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCouponForm;