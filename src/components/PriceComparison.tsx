import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface Price {
  store: string;
  price: number;
  url: string;
  last_updated: string;
}

interface PriceComparisonProps {
  productName: string;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ productName }) => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, [productName]);

  const fetchPrices = async () => {
    try {
      // In a real application, this would call a price comparison API
      // For demo purposes, we'll use mock data
      const mockPrices: Price[] = [
        {
          store: "Store A",
          price: 99.99,
          url: "https://store-a.com",
          last_updated: new Date().toISOString()
        },
        {
          store: "Store B",
          price: 89.99,
          url: "https://store-b.com",
          last_updated: new Date().toISOString()
        }
      ];
      
      setPrices(mockPrices);
    } catch (error: any) {
      toast.error('Failed to fetch price comparison');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Price Comparison</h3>
      {loading ? (
        <p className="text-gray-400">Loading prices...</p>
      ) : (
        <div className="space-y-2">
          {prices.map((price, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-zinc-700 rounded">
              <span className="text-white">{price.store}</span>
              <div className="flex items-center gap-4">
                <span className="text-green-400">${price.price}</span>
                <a
                  href={price.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceComparison;