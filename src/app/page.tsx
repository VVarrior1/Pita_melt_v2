import React from "react";
import Link from "next/link";
import Hero from "@/components/home/Hero";

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <Hero
        subtitle="We’re preparing something delicious. Our website is under development."
        primaryCta={{ href: "/home", label: "View Preview Site" }}
        secondaryCta={{ href: "/menu", label: "Browse Menu", variant: "outline" }}
      />

      <div className="py-12 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300 mb-6">
            Online ordering and payments are being finalized. You can browse our
            menu and preview the experience while we finish setup.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/menu" className="underline text-[#f17105]">
              Continue to Menu
            </Link>
            <span className="text-gray-500">•</span>
            <Link href="/home" className="underline text-[#f17105]">
              View Full Preview Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
