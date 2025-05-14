import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Statistics = () => {
  const [topCoupons, setTopCoupons] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch top voted coupons
      const { data: votedCoupons } = await supabase
        .from('coupons')
        .select('*')
        .order('helpful_votes', { ascending: false })
        .limit(10);

      setTopCoupons(votedCoupons || []);

      // Fetch category statistics
      const { data: categoryCoupons } = await supabase
        .from('coupons')
        .select('category');

      const categoryCount = (categoryCoupons || []).reduce((acc: any, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      setCategoryStats({
        labels: Object.keys(categoryCount),
        datasets: [{
          data: Object.values(categoryCount),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }]
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Top Voted Coupons',
        color: 'white'
      }
    },
    scales: {
      y: {
        ticks: {
          color: 'white'
        }
      },
      x: {
        ticks: {
          color: 'white'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Coupons by Category',
        color: 'white'
      }
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading statistics...</div>;
  }

  return (
    <div className="p-6 bg-zinc-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Coupon Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Coupons Chart */}
        <div className="bg-zinc-800 p-4 rounded-lg">
          <Bar
            data={{
              labels: topCoupons.map(c => c.title.substring(0, 20) + '...'),
              datasets: [{
                label: 'Helpful Votes',
                data: topCoupons.map(c => c.helpful_votes),
                backgroundColor: '#4CAF50'
              }]
            }}
            options={chartOptions}
          />
        </div>

        {/* Category Distribution */}
        <div className="bg-zinc-800 p-4 rounded-lg">
          <Pie data={categoryStats} options={pieOptions} />
        </div>

        {/* Top Coupons List */}
        <div className="bg-zinc-800 p-4 rounded-lg col-span-full">
          <h3 className="text-xl font-semibold text-white mb-4">Top 10 Most Helpful Coupons</h3>
          <div className="space-y-2">
            {topCoupons.map((coupon, index) => (
              <div key={coupon.id} className="flex items-center justify-between bg-zinc-700 p-3 rounded">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-400 mr-4">{index + 1}</span>
                  <div>
                    <h4 className="font-medium text-white">{coupon.title}</h4>
                    <p className="text-sm text-gray-300">{coupon.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-green-400">
                    <span className="font-bold">{coupon.helpful_votes}</span> helpful votes
                  </div>
                  <div className="text-red-400">
                    <span className="font-bold">{coupon.unhelpful_votes}</span> unhelpful votes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;