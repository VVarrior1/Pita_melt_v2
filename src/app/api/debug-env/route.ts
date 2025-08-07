import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    stripe_key_exists: !!process.env.STRIPE_SECRET_KEY,
    stripe_key_starts_with: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
    stripe_key_length: process.env.STRIPE_SECRET_KEY?.length,
    publishable_key_exists: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    publishable_key_starts_with: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) + '...',
    node_env: process.env.NODE_ENV,
    nextauth_url: process.env.NEXTAUTH_URL
  });
}