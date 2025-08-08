import React from "react";
import { Leaf, Users, Utensils } from "lucide-react";

export default function CateringPage() {
  const features = [
    { icon: <Users className="h-6 w-6" />, title: "Events Large & Small", desc: "From office lunches to big celebrations." },
    { icon: <Utensils className="h-6 w-6" />, title: "Custom Menus", desc: "Build the perfect spread for your guests." },
    { icon: <Leaf className="h-6 w-6 text-green-400" />, title: "Dietary Friendly", desc: "Great vegan and halal-friendly options." },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gray-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Catering <span className="text-[#f17105]">Services</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Make your next event delicious with authentic Mediterranean catering.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {features.map((f, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f17105] mb-3">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">How to inquire</h2>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>Tell us your event date, location, and guest count.</li>
            <li>Share dietary needs and preferred dishes.</li>
            <li>We’ll follow up with a tailored menu and quote.</li>
          </ol>
          <p className="text-gray-400 mt-4 text-sm">
            For now, please reach us via the Contact page while online forms are being finalized.
          </p>
        </div>
      </div>
    </div>
  );
}

