import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface CTASectionProps {
  heading?: string;
  subheading?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}

/**
 * CTASection: clear dual-CTA bar with strong brand color for conversion.
 */
export default function CTASection({
  heading = 'Ready to Order?',
  subheading = 'Experience authentic Mediterranean cuisine with convenient online ordering and pickup',
  primary = { href: '/menu', label: 'Browse Full Menu' },
  secondary = { href: '/about', label: 'Learn More About Us' }
}: CTASectionProps) {
  return (
    <section className="py-14 bg-[#f17105]">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{heading}</h2>
        <p className="text-lg text-white/95 mb-7">{subheading}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={primary.href}>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">{primary.label}</Button>
          </Link>
          <Link href={secondary.href}>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#f17105]"
            >
              {secondary.label}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

