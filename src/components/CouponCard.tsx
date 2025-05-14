import React, { useState, useEffect } from 'react';
import { supabase, checkAuth } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Clock, Copy, ExternalLink, Share2, Twitter, Facebook, Linkedin, Apple as WhatsApp } from 'lucide-react';

interface CouponCardProps {
  coupon: {
    id: string;
    title: string;
    code: string;
    description?: string;
    image_url?: string;
    website_link?: string;
    fixed_discount?: number;
    percentage_discount?: number;
    validity_date?: string;
    memex_payment: boolean;
    category?: string;
    country: string;
    brand?: string;
  };
  user?: {
    id: string;
    payment_verified?: boolean;
    isAdmin?: boolean;
  } | null;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, user }) => {
  const [showCode, setShowCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (coupon.validity_date) {
        const end = new Date(coupon.validity_date).getTime();
        const now = new Date().getTime();
        const distance = end - now;

        if (distance < 0) {
          setTimeLeft('Expired');
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        }
      } else {
        setTimeLeft('No expiration');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [coupon.validity_date]);

  const handleShowCode = () => {
    setShowCode(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success('Code copied to clipboard!');
  };

  const handleShare = (platform: string) => {
    const couponUrl = `${window.location.origin}/coupon/${coupon.id}`;
    const text = `Check out this great deal: ${coupon.title}`;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(couponUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(couponUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(couponUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + couponUrl)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className="coupon-card">
      <div className="coupon-header">
        <h3 className="coupon-title">{coupon.title}</h3>
        {coupon.memex_payment && (
          <div className="memex-badge">MEMEX</div>
        )}
      </div>

      <div className="coupon-image-container">
        {coupon.image_url ? (
          <img src={coupon.image_url} alt={coupon.title} className="coupon-image" />
        ) : (
          <div className="coupon-image-placeholder" />
        )}
        <div className="absolute top-4 left-4 z-10">
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="share-button"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {showShareMenu && (
              <div className="share-menu">
                <button onClick={() => handleShare('twitter')} className="share-option">
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </button>
                <button onClick={() => handleShare('facebook')} className="share-option">
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </button>
                <button onClick={() => handleShare('linkedin')} className="share-option">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </button>
                <button onClick={() => handleShare('whatsapp')} className="share-option">
                  <WhatsApp className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {(coupon.fixed_discount || coupon.percentage_discount) && (
          <div className="coupon-discount-badge">
            {coupon.fixed_discount ? `$${coupon.fixed_discount} OFF` : `${coupon.percentage_discount}% OFF`}
          </div>
        )}
        <div className="timer">
          <Clock size={16} />
          <span className="timer-text">{timeLeft}</span>
        </div>
      </div>

      <div className="coupon-content">
        <p className="coupon-description">{coupon.description}</p>

        <div className="flex flex-col gap-4 mt-auto">
          <div className="coupon-code-container">
            {showCode ? (
              <div className="flex items-center gap-2">
                <div className="coupon-code flex-grow">{coupon.code}</div>
                <button onClick={copyToClipboard} className="copy-button-inline">
                  <Copy size={16} />
                </button>
              </div>
            ) : (
              <button onClick={handleShowCode} className="show-code-button">
                Show Code
              </button>
            )}
          </div>

          {coupon.website_link && (
            <a
              href={coupon.website_link}
              target="_blank"
              rel="noopener noreferrer"
              className="website-link"
            >
              <ExternalLink size={16} />
              Visit Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;