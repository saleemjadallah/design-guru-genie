
import React from "react";
import { Button } from "@/components/ui/button";
import { WaveDivider } from "../patterns/WaveDivider";
import { CheckIcon } from "lucide-react";

export const PricingSection = () => {
  return (
    <>
      {/* Wave divider before section */}
      <WaveDivider fillColor="#ffffff" height={60} className="my-4" />
      
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-2xl relative mt-12 overflow-hidden">
        <div className="absolute inset-0 topographic-pattern rounded-2xl opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Simple, Transparent Pricing
            </h2>
            <div className="h-1 w-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6"></div>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Choose the plan that best fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-indigo-100 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-70 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
              
              <div className="relative">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Monthly Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-neutral-900">$18</span>
                  <span className="text-neutral-500 ml-2">/ month</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Unlimited Design reviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">AI-powered suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Cloud storage integration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">24/7 support</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Get Started
                </Button>
              </div>
            </div>
            
            {/* Annual Plan */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-8 border border-indigo-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-indigo-200 opacity-70 rounded-full"></div>
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                BEST VALUE
              </div>
              
              <div className="relative">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Pay Annually</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-neutral-900">$162</span>
                  <span className="text-neutral-500 ml-2">/ year</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Everything in monthly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-purple-700">Save 25% annually</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-purple-700">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-purple-700">First access to new features</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Wave divider after section */}
      <WaveDivider fillColor="#F9FAFB" height={60} className="my-8 transform rotate-180" />
    </>
  );
};
