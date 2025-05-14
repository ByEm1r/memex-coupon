import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using the MemeX Coupon platform, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
        <p className="mb-4">
          To use certain features of our platform, you must register for an account. You agree to provide accurate,
          current, and complete information during registration and to update such information to keep it accurate,
          current, and complete.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. MEMEX Payments</h2>
        <p className="mb-4">
          Some features of our platform require MEMEX payment. By making MEMEX payments, you acknowledge and agree
          that all transactions are final and non-refundable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Coupon Usage</h2>
        <p className="mb-4">
          Users are responsible for verifying the validity and terms of all coupons. We do not guarantee the
          availability or effectiveness of any coupons posted on our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. User Content</h2>
        <p className="mb-4">
          By posting content on our platform, you grant us a non-exclusive, worldwide, royalty-free license to use,
          modify, publicly display, and distribute such content on our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
        <p className="mb-4">
          Users may not:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Post fraudulent or misleading coupons</li>
          <li>Attempt to circumvent any platform security measures</li>
          <li>Engage in any activity that disrupts our services</li>
          <li>Collect user information without consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
        <p className="mb-4">
          We reserve the right to terminate or suspend your account at any time for any reason, including violation
          of these Terms of Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
        <p className="mb-4">
          We may modify these Terms of Service at any time. Continued use of our platform after any modifications
          indicates your acceptance of the updated terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
        <p className="mb-4">
          For questions about these Terms of Service, please contact us at support@memex-coupon.com
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;