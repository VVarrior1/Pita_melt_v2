import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  priceDisplay: string;
  imageSrc: string;
}

export interface FeaturedSectionProps {
  heading?: string;
  subheading?: string;
  items: FeaturedItem[];
}

/**
 * FeaturedSection: highlights top-selling items using real imagery for better conversion.
 */
export default function FeaturedSection({
  heading = 'Featured Favorites',
  subheading = 'Taste the authentic flavors of the Mediterranean with our most popular dishes',
  items
}: FeaturedSectionProps) {
  return (
    <section className="py-14 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            {heading.split(' ').slice(0, 1).join(' ')}{' '}
            <span className="text-[#f17105]">{heading.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <article
              key={item.id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300"
            >
              <div className="relative h-44">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 mb-4 text-sm">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#f17105] font-bold">{item.priceDisplay}</span>
                  <Link href="/menu" aria-label={`Order ${item.title} now`}>
                    <Button size="sm">Order Now</Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

