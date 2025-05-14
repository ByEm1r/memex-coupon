import React from 'react';

interface AdminSummaryProps {
  coupons: any[];
  memberCount: number;
}

const AdminSummary: React.FC<AdminSummaryProps> = ({ coupons, memberCount }) => {
  return (
    <div className="admin-summary-grid">
      <div className="admin-summary-card">
        <h3 className="admin-summary-title">Total Coupons</h3>
        <p className="admin-summary-value">{coupons.length}</p>
      </div>
      <div className="admin-summary-card">
        <h3 className="admin-summary-title">Total Members</h3>
        <p className="admin-summary-value">{memberCount}</p>
      </div>
      <div className="admin-summary-card">
        <h3 className="admin-summary-title">Approved Coupons</h3>
        <p className="admin-summary-value">{coupons.filter(coupon => coupon.approved).length}</p>
      </div>
    </div>
  );
};

export default AdminSummary;
