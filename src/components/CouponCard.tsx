import React, { useState, useEffect, memo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Clock, Copy, ExternalLink, Share2, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';

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
    currency?: string;
  };
  user?: {
    id: string;
    payment_verified?: boolean;
    isAdmin?: boolean;
  } | null;
}

const CurrencySymbols: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'TRY': '₺',
  'JPY': '¥',
  'MEMEX': 'MEMEX'
};

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleShowCode = () => {
    setShowCode(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success('Code copied to clipboard!');
  };

  const handleShare = (platform: string) => {
    const websiteUrl = 'https://coupon.memextoken.org';
    const text = `Check out this amazing deal on MemeX Coupon: ${coupon.title}. Find more exclusive deals at ${websiteUrl}`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteUrl)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(websiteUrl)}&title=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(text);
        toast.success('Share text copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  return (
      <div className="coupon-card will-change-transform">
        <div className="coupon-header">
          <h3 className="coupon-title">{coupon.title}</h3>
          {coupon.memex_payment && (
              <div className="memex-badge">MEMEX</div>
          )}
        </div>

        <div className="coupon-image-container">
          {coupon.image_url ? (
              <img src={coupon.image_url} alt={coupon.title} className="coupon-image" loading="lazy" />
          ) : (
              <div className="coupon-image-placeholder" />
          )}
          <div className="absolute top-4 left-4 z-10 share-menu-container">
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShareMenu(!showShareMenu);
                }}
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
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button onClick={() => handleShare('copy')} className="share-option">
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                </div>
            )}
          </div>
          {(coupon.fixed_discount || coupon.percentage_discount) && (
              <div className="coupon-discount-badge">
                {coupon.fixed_discount
                    ? `${coupon.fixed_discount} ${CurrencySymbols[coupon.currency || 'MEMEX']} OFF`
                    : `${coupon.percentage_discount}% OFF`}
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
            <div className="flex gap-2">
              {showCode ? (
                  <div className="flex items-center gap-2 flex-1">
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
      </div>
  );
};

CouponCard.displayName = 'CouponCard';

export default memo(CouponCard);