import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Timer, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * HeroProps defines the configurable properties of the homepage hero section.
 * Keeping this component modular allows reuse across pages with different content.
 */
export interface HeroProps {
  /** Background image path under `public/` */
  backgroundImageSrc?: string;
  /** Optional logo image path */
  logoSrc?: string;
  /** Main title content; can contain highlighted spans */
  title?: React.ReactNode;
  /** Subheading sentence under the title */
  subtitle?: string;
  /** Primary CTA button configuration */
  primaryCta?: { href: string; label: string };
  /** Secondary CTA button configuration */
  secondaryCta?: {
    href: string;
    label: string;
    variant?: "outline" | "secondary";
  };
}

/**
 * Hero: Mobile-first hero section with layered image background, headline, CTAs,
 * and a small set of trust badges to improve conversion without heavy styling.
 */
export default function Hero({
  backgroundImageSrc = "/images/shawarmabg.webp",
  logoSrc = "/images/PitaMeltLogo1.jpg",
  title = (
    <>
      Welcome to <span className="text-[#f17105]">Pita Melt</span>
    </>
  ),
  subtitle = "Authentic Mediterranean flavors in Calgary. Fresh, fast, and made with love.",
  primaryCta = { href: "/menu", label: "Order Online Now" },
  secondaryCta = { href: "/about", label: "Learn More", variant: "outline" },
}: HeroProps) {
  return (
    <section className="relative min-h-[78vh] flex items-center justify-center bg-black text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImageSrc}
          alt="Mediterranean food background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        {logoSrc && (
          <div className="mb-6">
            <Image
              src={logoSrc}
              alt="Pita Melt logo"
              width={110}
              height={110}
              className="mx-auto rounded-full"
              priority
            />
          </div>
        )}

        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-6">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {primaryCta && (
            <Link href={primaryCta.href} aria-label={primaryCta.label}>
              <Button size="lg" className="w-full sm:w-auto">
                {primaryCta.label}
              </Button>
            </Link>
          )}
          {secondaryCta && (
            <Link href={secondaryCta.href} aria-label={secondaryCta.label}>
              <Button
                size="lg"
                variant={secondaryCta.variant ?? "outline"}
                className="w-full sm:w-auto"
              >
                {secondaryCta.label}
              </Button>
            </Link>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto text-sm">
          <div className="flex items-center justify-center gap-2 text-gray-200">
            <Leaf className="h-4 w-4 text-green-400" />
            <span>Fresh Ingredients</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-200">
            <Timer className="h-4 w-4 text-yellow-300" />
            <span>Fast Pickup</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-200">
            <HeartHandshake className="h-4 w-4 text-rose-300" />
            <span>Family-Owned</span>
          </div>
        </div>
      </div>
    </section>
  );
}
