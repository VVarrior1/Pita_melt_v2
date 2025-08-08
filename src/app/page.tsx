import React from "react";
import Link from "next/link";
import Hero from "@/components/home/Hero";

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <Hero
        subtitle="We’re preparing something delicious. Our website is under development."
        showCtas={false}
      />

      <div className="py-12 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            Online ordering and payments are being finalized. Please check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
