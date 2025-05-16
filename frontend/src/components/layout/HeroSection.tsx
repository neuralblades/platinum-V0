"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import IntegratedSearchFilters from '@/components/search/IntegratedSearchFilters';
import SearchInput from '@/components/search/SearchInput';
import { PropertyFilter } from '@/services/propertyService';
import { motion } from 'framer-motion';
import { FadeIn, FadeInUp } from '@/components/animations/MotionWrapper';

const HeroSection = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<PropertyFilter>({
    location: '',
    type: '',
    minPrice: undefined,
    maxPrice: undefined,
    keyword: '',
  });

  return (
    <div className="relative text-white overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/Dubai.webm" type="video/webm" />
          {/* Fallback for browsers that don't support webm */}
          Your browser does not support the video tag.
        </video>
        {/* Overlay to make text more readable */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <motion.div
        className="w-full relative z-10 py-20 md:py-55 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Text - Centered */}
        <div className="text-center mb-8 px-4">
          <FadeInUp delay={0.3}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-lg">
              Find your home in Dubai.
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.5}>
            <p className="text-sm md:text-xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Discover exclusive properties in the most desirable locations worldwide.
            </p>
          </FadeInUp>
        </div>

        {/* Mobile Search Input Only */}
        <FadeInUp delay={0.7} className="w-full px-4 block md:hidden">
          <div className="max-w-6xl mx-auto">
            <SearchInput
              placeholder="Search by area, project or community..."
              initialValue={filters.keyword || ''}
              onSearch={(query) => {
                const queryParams = new URLSearchParams();
                if (query) queryParams.append('keyword', query);
                router.push(`/properties?${queryParams.toString()}`);
              }}
              className="w-full px-4 py-3 bg-white/90 text-gray-700 placeholder-gray-500"
            />
          </div>
        </FadeInUp>

        {/* Desktop Integrated Search and Filters - Full Width */}
        <FadeInUp delay={0.7} className="w-full px-4 hidden md:block">
          <div className="max-w-6xl mx-auto">
            <IntegratedSearchFilters
              filters={filters}
              onFilterChange={(newFilters) => setFilters(newFilters)}
              onApplyFilters={() => {
                // Build query string from filters
                const queryParams = new URLSearchParams();

                if (filters.keyword) queryParams.append('keyword', filters.keyword);
                if (filters.location) queryParams.append('location', filters.location);
                if (filters.type) queryParams.append('type', filters.type);
                if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
                if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
                if (filters.bedrooms !== undefined) queryParams.append('bedrooms', filters.bedrooms.toString());
                if (filters.bathrooms !== undefined) queryParams.append('bathrooms', filters.bathrooms.toString());

                // Navigate to properties page with filters
                router.push(`/properties?${queryParams.toString()}`);
              }}
              className="w-full"
            />
          </div>
        </FadeInUp>

        {/* Stats */}
        <FadeIn delay={0.9} className="mt-8 text-center text-md text-white/90 font-medium">
          <p>Premium Properties · Expert Agents · Exclusive Listings</p>
        </FadeIn>
      </motion.div>
    </div>
  );
};

export default HeroSection;
