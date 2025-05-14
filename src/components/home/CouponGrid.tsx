import React from 'react';
import CouponCard from '../CouponCard';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CouponGridProps {
  loading: boolean;
  currentCoupons: any[];
  getCouponColumns: () => string;
}

const CouponGrid: React.FC<CouponGridProps> = ({ loading, currentCoupons, getCouponColumns }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const couponVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      className={`grid ${getCouponColumns()} gap-6`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : currentCoupons.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No approved coupons match your search</p>
      ) : (
        currentCoupons.map((coupon) => (
          <motion.div key={coupon.id} variants={couponVariants}>
            <CouponCard
              key={coupon.id}
              coupon={coupon}
            />
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

export default CouponGrid;
