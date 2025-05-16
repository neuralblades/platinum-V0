"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { getFeaturedProperties, Property } from '@/services/propertyService';
import { motion } from 'framer-motion';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrapper';

type PropertyStatus = 'sale' | 'rent' | 'offplan';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PropertyStatus>('sale');

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setLoading(true);
      try {
        const response = await getFeaturedProperties();
        console.log('Featured properties response:', response);
        if (response.success && response.properties && response.properties.length > 0) {
          // Filter properties based on the active filter
          let filteredProperties = [...(response.properties || [])];

          console.log('All properties before filtering:', filteredProperties.map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            isOffplan: p.isOffplan
          })));

          if (activeFilter === 'sale') {
            filteredProperties = filteredProperties.filter(p => p.status === 'for-sale' && !p.isOffplan);
          } else if (activeFilter === 'rent') {
            filteredProperties = filteredProperties.filter(p => p.status === 'for-rent');
          } else if (activeFilter === 'offplan') {
            filteredProperties = filteredProperties.filter(p => p.isOffplan === true);
          }

          console.log(`Filtered properties (${activeFilter}):`, filteredProperties.map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            isOffplan: p.isOffplan
          })));

          // Sort properties by createdAt date (newest first) and take only the latest 3
          const latestProperties = filteredProperties
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);

          setProperties(latestProperties);
        }
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        setError('Failed to load featured properties');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, [activeFilter]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <FadeInUp>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Explore our handpicked selection of premium properties in the most sought-after locations.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="flex justify-center gap-4 mb-8 max-w-md mx-auto">
              <motion.button
                onClick={() => setActiveFilter('sale')}
                className={`px-6 py-2 rounded-md border ${activeFilter === 'sale'
                  ? 'border-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium shadow-lg'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                For Sale
              </motion.button>
              <motion.button
                onClick={() => setActiveFilter('rent')}
                className={`px-6 py-2 rounded-md border ${activeFilter === 'rent'
                  ? 'border-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium shadow-lg'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                For Rent
              </motion.button>
              <motion.button
                onClick={() => setActiveFilter('offplan')}
                className={`px-6 py-2 rounded-md border ${activeFilter === 'offplan'
                  ? 'border-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium shadow-lg'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Off Plan
              </motion.button>
            </div>
          </FadeInUp>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
          </div>
        ) : error ? (
          <FadeInUp>
            <div className="text-center text-gray-800 mb-8 p-4 bg-gray-100 rounded-md">{error}</div>
          </FadeInUp>
        ) : properties.length === 0 ? (
          <FadeInUp>
            <div className="text-center text-gray-800 mb-8 p-4 bg-gray-100 rounded-md">
              No featured properties available at the moment.
            </div>
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" delay={0.3}>
            {properties.map((property) => (
              <StaggerItem key={property.id}>
                <PropertyCard
                  id={property.id}
                  title={property.title}
                  price={property.price}
                  location={property.location}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  area={property.area}
                  imageUrl={property.mainImage}
                  featured={property.featured}
                  isOffplan={property.isOffplan}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <FadeInUp delay={0.5} className="text-center mt-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={activeFilter === 'offplan' ? '/properties/offplan' : `/properties?status=${activeFilter === 'sale' ? 'for-sale' : 'for-rent'}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-900 hover:to-gray-700 transition duration-300 font-medium shadow-lg rounded-md"
            >
              {activeFilter === 'sale' && 'View All Properties For Sale'}
              {activeFilter === 'rent' && 'View All Properties For Rent'}
              {activeFilter === 'offplan' && 'View All Off Plan Properties'}
            </Link>
          </motion.div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default FeaturedProperties;
