import React from 'react';
import Link from 'next/link';
import { 
  TwitterIcon, 
  LinkedinIcon, 
  GithubIcon, 
  TrendingUpIcon,
  MailIcon,
  HeartIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'FinBoard';

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'API', href: '/api' },
      { name: 'Roadmap', href: '/roadmap' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Status', href: '/status' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Guidelines', href: '/guidelines' },
    ],
  };

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/finboard',
      icon: TwitterIcon,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/finboard',
      icon: LinkedinIcon,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/finboard',
      icon: GithubIcon,
    },
    {
      name: 'Email',
      href: 'mailto:hello@finboard.com',
      icon: MailIcon,
    },
  ];

  return (
    <footer className={cn('bg-background border-t border-border', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="bg-primary text-primary-foreground rounded-lg p-2">
                  <TrendingUpIcon className="h-6 w-6" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  {appName}
                </span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-xs">
                The premier platform for financial insights, market analysis, and investment strategies. 
                Join our community of finance professionals and enthusiasts.
              </p>
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter section */}
        <div className="border-t border-border py-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Stay updated
              </h3>
              <p className="text-muted-foreground text-sm">
                Get the latest financial insights and market analysis delivered to your inbox.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8">
              <form className="sm:flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
                />
                <button
                  type="submit"
                  className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>&copy; {currentYear} {appName}. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline flex items-center">
                Made with <HeartIcon className="h-4 w-4 mx-1 text-red-500" /> for the financial community
              </span>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-muted-foreground">
                Backend: {process.env.NEXT_PUBLIC_BACKEND_TYPE?.toUpperCase() || 'FastAPI'} • 
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};