import React from 'react';

interface HomeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  categories: string[];
  countries: string[];
}

const HomeFilters: React.FC<HomeFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCountry,
  setSelectedCountry,
  categories,
  countries,
}) => {
  return (
    <>
      <input
        type="text"
        placeholder="Search coupons..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input mb-4 w-full sm:w-auto"
      />

      {/* Category and Country Selectors */}
      <div className="flex justify-between mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-input w-1/2 mr-2"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="form-input w-1/2"
        >
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
    </>
  );
};

export default HomeFilters;