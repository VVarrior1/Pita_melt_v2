import React from 'react';
import Link from 'next/link';
import Hero from '@/components/home/Hero';
import InfoStrip from '@/components/home/InfoStrip';
import FeaturedSection from '@/components/home/FeaturedSection';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';
import MobileOrderBar from '@/components/home/MobileOrderBar';

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <Hero />
      <InfoStrip />

      <FeaturedSection
        items={[
          {
            id: 'shawarma',
            title: 'Chicken Shawarma',
            description:
              'Marinated chicken wrapped in fresh pita with garlic sauce and vegetables',
            priceDisplay: 'From $8.50',
            imageSrc: '/images/Shawarma1.jpg'
          },
          {
            id: 'falafel',
            title: 'Falafel Wrap',
            description: 'Crispy homemade falafel with fresh vegetables and tahini sauce',
            priceDisplay: 'From $7.50',
            imageSrc: '/images/falafelwrap.jpg'
          },
          {
            id: 'tenderloin',
            title: 'Tenderloin Platter',
            description: 'Premium beef tenderloin with rice, salad, and sauces',
            priceDisplay: '$16.99',
            imageSrc: '/images/tenderloinplatter.jpg'
          }
        ]}
      />

      <Testimonials
        testimonials={[
          { id: '1', quote: 'Best shawarma in the city. Fresh and flavorful!', author: 'Amina' },
          { id: '2', quote: 'Fast pickup and generous portions. Highly recommend.', author: 'Jason' },
          { id: '3', quote: 'Falafel wrap is incredible—crispy and delicious.', author: 'Priya' }
        ]}
      />

      <CTASection />
      <MobileOrderBar />
    </div>
  );
}