import React from 'react';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
}

export interface TestimonialsProps {
  heading?: string;
  testimonials: Testimonial[];
}

/**
 * Testimonials: brief social proof carousel-free grid; light styling to avoid distraction.
 */
export default function Testimonials({ heading = 'What Customers Say', testimonials }: TestimonialsProps) {
  if (!testimonials?.length) return null;
  return (
    <section className="py-14 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          <span className="text-[#f17105]">{heading.split(' ')[0]}</span>{' '}
          {heading.split(' ').slice(1).join(' ')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
              <p className="text-gray-200 mb-3">“{t.quote}”</p>
              <footer className="text-sm text-gray-400">— {t.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

