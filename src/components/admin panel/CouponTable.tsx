import React from 'react';
import { Loader2 } from 'lucide-react';

interface CouponTableProps {
  coupons: any[];
  loading: boolean;
  toggleApprove: (id: string, currentApprovalStatus: boolean) => Promise<void>;
  startEditing: (coupon: any) => void;
  handleDelete: (id: string) => Promise<void>;
  filteredCoupons: any[];
}

const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  loading,
  toggleApprove,
  startEditing,
  handleDelete,
  filteredCoupons
}) => {
  return (
    <tbody className="admin-table-body">
      {loading ? (
        <tr>
          <td colSpan={6} className="text-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 inline-block" />
          </td>
        </tr>
      ) : (
        filteredCoupons.map((coupon) => (
          <tr key={coupon.id} className="admin-table-row">
            <td className="admin-table-cell">{coupon.title}</td>
            <td className="admin-table-cell">{coupon.code}</td>
            <td className="admin-table-cell">{coupon.discount}</td>
            <td className="admin-table-cell">{coupon.description}</td>
            <td className="admin-table-cell">{coupon.brand}</td>
            <td className="admin-table-cell admin-table-actions">
              <button
                onClick={() => toggleApprove(coupon.id, coupon.approved)}
                className="text-green-600 hover:text-green-900 mr-3"
              >
                {coupon.approved ? 'Unapprove' : 'Approve'}
              </button>
              <button
                onClick={() => startEditing(coupon)}
                className="text-blue-600 hover:text-blue-900 mr-3"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  );
};

export default CouponTable;
