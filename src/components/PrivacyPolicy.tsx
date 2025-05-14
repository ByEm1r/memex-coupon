import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us, including:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Name and contact information</li>
          <li>Telegram username</li>
          <li>Country of residence</li>
          <li>Payment information</li>
          <li>Content you post on our platform</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Provide and maintain our services</li>
          <li>Process your transactions</li>
          <li>Send you technical notices and support messages</li>
          <li>Communicate with you about products, services, and events</li>
          <li>Monitor and analyze trends and usage</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
        <p className="mb-4">
          We do not share your personal information with third parties except:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and prevent fraud</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal information
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Object to processing of your information</li>
          <li>Withdraw consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on our platform and hold certain
          information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Changes to Privacy Policy</h2>
        <p className="mb-4">
          We may update this privacy policy from time to time. We will notify you of any changes by posting the
          new privacy policy on this page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at privacy@memex-coupon.com
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;