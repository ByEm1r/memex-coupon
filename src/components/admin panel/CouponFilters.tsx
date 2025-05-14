import React from 'react';

interface CouponFiltersProps {
  couponTitleFilter: string;
  couponCodeFilter: string;
  couponDiscountFilter: string;
  couponDescriptionFilter: string;
  brandFilter: string;
  availableBrands: string[];
  handleCouponTitleFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCouponCodeFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCouponDiscountFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCouponDescriptionFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBrandFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CouponFilters: React.FC<CouponFiltersProps> = ({
  couponTitleFilter,
  couponCodeFilter,
  couponDiscountFilter,
  couponDescriptionFilter,
  brandFilter,
  availableBrands,
  handleCouponTitleFilterChange,
  handleCouponCodeFilterChange,
  handleCouponDiscountFilterChange,
  handleCouponDescriptionFilterChange,
  handleBrandFilterChange,
}) => {
  return (
    <>
      <th className="admin-table-header-cell">
        Title
        <input
          type="text"
          placeholder="Filter Title"
          value={couponTitleFilter}
          onChange={handleCouponTitleFilterChange}
          className="admin-input"
        />
      </th>
      <th className="admin-table-header-cell">
        Code
        <input
          type="text"
          placeholder="Filter Code"
          value={couponCodeFilter}
          onChange={handleCouponCodeFilterChange}
          className="admin-input"
        />
      </th>
      <th className="admin-table-header-cell">
        Discount
        <input
          type="text"
          placeholder="Filter Discount"
          value={couponDiscountFilter}
          onChange={handleCouponDiscountFilterChange}
          className="admin-input"
        />
      </th>
      <th className="admin-table-header-cell">
        Description
        <input
          type="text"
          placeholder="Filter Description"
          value={couponDescriptionFilter}
          onChange={handleCouponDescriptionFilterChange}
          className="admin-input"
        />
      </th>
      <th className="admin-table-header-cell">
        Brand
        <input
          type="text"
          placeholder="Filter Brand"
          value={brandFilter}
          onChange={handleBrandFilterChange}
          className="admin-input"
          list="brandOptions"
        />
        <datalist id="brandOptions">
          {availableBrands.map((brand, index) => (
            <option key={index} value={brand} />
          ))}
        </datalist>
      </th>
    </>
  );
};

export default CouponFilters;
