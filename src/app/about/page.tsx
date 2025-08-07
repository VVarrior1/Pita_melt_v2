import React from 'react';
import Image from 'next/image';
import { Heart, Users, Award, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f17105] to-red-600 opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-[#f17105]">Pita Melt</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Your gateway to a premium Mediterranean adventure in the heart of Calgary
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our <span className="text-[#f17105]">Story</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Founded with a passion for authentic Mediterranean cuisine, Pita Melt has been serving 
                  Calgary with the finest Middle Eastern flavors since our opening. We believe that great 
                  food brings people together, and every dish we prepare is crafted with love and tradition.
                </p>
                <p>
                  Our journey began with a simple mission: to share the rich, diverse flavors of the 
                  Mediterranean region with our community. From our signature shawarma to our fresh 
                  falafels, every recipe has been carefully developed to honor traditional cooking 
                  methods while appealing to modern tastes.
                </p>
                <p>
                  Located in Temple, Calgary, we&apos;ve become a beloved destination for those seeking 
                  authentic, fresh, and delicious Mediterranean food. Our commitment to quality 
                  ingredients and exceptional service has made us a favorite among locals and 
                  visitors alike.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-[#f17105] to-red-600 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🥙</div>
                <h3 className="text-2xl font-bold mb-4 text-white">Fresh & Authentic</h3>
                <p className="text-white text-opacity-90">
                  Every dish is prepared fresh daily using traditional recipes and the finest ingredients
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What We <span className="text-[#f17105]">Stand For</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our values guide everything we do, from sourcing ingredients to serving our customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f17105] rounded-full mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Passion</h3>
              <p className="text-gray-400">
                We pour our heart into every dish, ensuring each meal is a labor of love
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f17105] rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality</h3>
              <p className="text-gray-400">
                Only the finest, freshest ingredients make it into our kitchen and onto your plate
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f17105] rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-400">
                We're proud to be part of the Calgary community and serve our neighbors
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f17105] rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tradition</h3>
              <p className="text-gray-400">
                Honoring time-tested recipes while innovating for contemporary tastes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Message */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">
              A Message from Our <span className="text-[#f17105]">Team</span>
            </h2>
            <blockquote className="text-xl text-gray-300 italic mb-6">
              "We believe that food is more than just sustenance—it's a way to connect cultures, 
              share experiences, and create lasting memories. Every time you visit Pita Melt, 
              you're not just getting a meal; you're embarking on a culinary journey through 
              the Mediterranean."
            </blockquote>
            <p className="text-[#f17105] font-semibold">
              - The Pita Melt Family
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#f17105]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Experience the Difference
          </h2>
          <p className="text-xl text-white mb-8">
            Taste why Calgary loves our authentic Mediterranean cuisine
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/menu"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#f17105] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Our Menu
            </a>
            <a 
              href="tel:(403) 293-5809"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#f17105] transition-colors"
            >
              Call to Order
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}