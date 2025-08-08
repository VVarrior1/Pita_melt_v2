"use client";

import React, { useState } from "react";
import { Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // In development: just simulate send and show toast via UI feedback
    setTimeout(() => setIsSubmitting(false), 800);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contact <span className="text-[#f17105]">Us</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Questions or catering inquiries? We’d love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Get in touch</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Your name"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f17105]"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f17105]"
            />
            <textarea
              name="message"
              required
              rows={5}
              placeholder="How can we help?"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f17105]"
            />
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              <Send className="h-4 w-4 mr-2" /> Send Message
            </Button>
          </form>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Contact details</h2>
          <div className="flex items-center gap-2 text-gray-300">
            <Phone className="h-5 w-5 text-[#f17105]" /> (403) 293-5809
          </div>
          <div className="flex items-start gap-2 text-gray-300">
            <MapPin className="h-5 w-5 text-[#f17105] mt-1" />
            7196 Temple Dr NE #22, Calgary, AB
          </div>
          <p className="text-gray-400 text-sm">Hours: Mon-Thu 11AM–10PM, Fri-Sat 11AM–11PM, Sun 12PM–9PM</p>
        </div>
      </div>
    </div>
  );
}

