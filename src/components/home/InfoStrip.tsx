import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';

/**
 * InfoStrip: concise contact and hours bar for quick access on mobile.
 */
export default function InfoStrip() {
  return (
    <section className="py-10 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f17105] rounded-full mb-3">
              <Phone className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Call Us</h3>
            <a href="tel:(403) 293-5809" className="text-[#f17105] hover:text-[#e55a00] transition-colors">
              (403) 293-5809
            </a>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f17105] rounded-full mb-3">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Visit Us</h3>
            <a
              href="https://maps.google.com/?q=7196+Temple+Dr+NE+#22+Calgary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f17105] hover:text-[#e55a00] transition-colors"
            >
              7196 Temple Dr NE #22, Calgary
            </a>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f17105] rounded-full mb-3">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Hours</h3>
            <div className="text-gray-300 text-sm leading-relaxed">
              <p>Mon-Thu: 11AM-10PM</p>
              <p>Fri-Sat: 11AM-11PM</p>
              <p>Sun: 12PM-9PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

