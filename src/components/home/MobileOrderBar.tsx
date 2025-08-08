import React from "react";
import Link from "next/link";
import { PhoneCall, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * MobileOrderBar: sticky bottom bar on small screens to drive quick actions.
 */
export default function MobileOrderBar() {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-4 md:hidden">
      <div className="mx-auto max-w-md rounded-full bg-gray-900/90 backdrop-blur border border-gray-700 shadow-lg p-2 flex items-center gap-2">
        <Link href="/menu" className="flex-1">
          <Button className="w-full" size="md">
            <Utensils className="h-4 w-4 mr-2" /> Order Online
          </Button>
        </Link>
        <a href="tel:(403) 293-5809" className="flex-1">
          <Button variant="outline" className="w-full" size="md">
            <PhoneCall className="h-4 w-4 mr-2" /> Call
          </Button>
        </a>
      </div>
    </div>
  );
}
