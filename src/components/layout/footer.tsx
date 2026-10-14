import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { useApp } from '@/App';
import { Button } from '@/components/ui';
import { 
  Heart, 
  Twitter, 
  Facebook, 
  Linkedin,
  Github,
  Globe
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useApp();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: '#', label: 'Twitter' },
    { icon: <Facebook className="h-5 w-5" />, href: '#', label: 'Facebook' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#', label: 'LinkedIn' },
    { icon: <Github className="h-5 w-5" />, href: '#', label: 'GitHub' },
  ];

  const footerLinks = [
    { label: 'About', to: '/about' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Contact', to: '/contact' },
    { label: 'Documentation', to: '/docs' },
  ];

  return (
    <footer
      className={cn(
        'bg-white border-t border-secondary-200 py-8',
        'safe-area-bottom'
      )}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-600 rounded-xl">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <span className="font-semibold text-secondary-900">{APP_CONFIG.name}</span>
                <p className="text-xs text-secondary-500">{APP_CONFIG.company}</p>
              </div>
            </Link>
            <p className="text-sm text-secondary-500 mb-4">
              {APP_CONFIG.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-600 hover:text-secondary-900 transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-secondary-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-secondary-500 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="font-semibold text-secondary-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/ai-chat"
                  className="text-sm text-secondary-500 hover:text-primary-600 transition-colors"
                >
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  to="/documents"
                  className="text-sm text-secondary-500 hover:text-primary-600 transition-colors"
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link
                  to="/research"
                  className="text-sm text-secondary-500 hover:text-primary-600 transition-colors"
                >
                  Research
                </Link>
              </li>
              <li>
                <Link
                  to="/analysis"
                  className="text-sm text-secondary-500 hover:text-primary-600 transition-colors"
                >
                  Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="font-semibold text-secondary-900 mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-secondary-500">
              <p>
                <strong>Email:</strong> {APP_CONFIG.supportEmail}
              </p>
              <p>
                <strong>Phone:</strong> {APP_CONFIG.supportPhone}
              </p>
              <p>
                <strong>Website:</strong> {APP_CONFIG.website}
              </p>
              <p>
                <strong>Address:</strong> Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-secondary-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-500">
            &copy; {currentYear} {APP_CONFIG.company}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-secondary-500">
              Made with <Heart className="inline h-4 w-4 text-red-500" /> in Bangladesh
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm"
            >
              Back to Top
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
