"use client";
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import IntegratedSearchFilters from '@/components/search/IntegratedSearchFilters';
import { getProperties, PropertyFilter, Property } from '@/services/propertyService';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { motion } from 'framer-motion';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrapper';

export default function OffPlanPropertiesPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<PropertyFilter>({
    isOffplan: true,
    page: 1,
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    location: searchParams.get('location') || '',
    keyword: searchParams.get('keyword') || '',
  });

  // Fetch properties with current filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await getProperties(filters);
      if (response.success && response.properties.length > 0) {
        setProperties(response.properties);
        setTotalPages(response.pages);
        setCurrentPage(response.page);
      } else {
        setProperties([]);
        setError('No off-plan properties found matching your criteria.');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: PropertyFilter) => {
    setFilters({ ...filters, ...newFilters, page: 1, isOffplan: true });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page, isOffplan: true });
  };

  // Apply filters and fetch properties
  const applyFilters = () => {
    fetchProperties();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Properties', href: '/properties' },
            { label: 'Off Plan' }
          ]}
        />
      </div>
      <FadeInUp className="mb-8">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Off Plan Properties
        </motion.h1>
        <motion.p
          className="text-gray-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Discover our exclusive collection of off-plan properties in Dubai. Invest in the future with these upcoming developments offering modern designs and premium amenities.
        </motion.p>
        <motion.div
          className="flex space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              href="/properties"
              variant="outline"
              size="lg"
            >
              Ready Properties
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              href="/properties/offplan"
              variant="accent"
              size="lg"
            >
              Off Plan Properties
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              href="/properties/map?isOffplan=true"
              variant="outline"
              size="lg"
            >
              Map View
            </Button>
          </motion.div>
        </motion.div>
      </FadeInUp>
        {/* Integrated Search and Filters */}
        <FadeInUp delay={0.3} className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
          >
            <IntegratedSearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              className="w-full"
            />
          </motion.div>
        </FadeInUp>

        {/* Property Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              className="rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : error ? (
          <motion.div
            className="text-center text-red-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        ) : properties.length === 0 ? (
          <motion.div
            className="text-center text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            No off-plan properties found matching your criteria.
          </motion.div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" delay={0.05}>
            {properties.map((property) => (
              <StaggerItem key={property.id}>
                <motion.div
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <PropertyCard
                    id={property.id}
                    title={property.title}
                    price={property.price}
                    location={property.location}
                    bedrooms={property.bedrooms}
                    bedroomRange={property.bedroomRange}
                    bathrooms={property.bathrooms}
                    area={property.area}
                    imageUrl={property.mainImage}
                    featured={property.featured}
                    isOffplan={true}
                    yearBuilt={property.yearBuilt}
                    paymentPlan={property.paymentPlan}
                    agent={property.agent}
                  />
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <FadeInUp delay={0.4}>
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    Previous
                  </Button>
                </motion.div>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <motion.div
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mx-1"
                  >
                    <Button
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                    >
                      {page}
                    </Button>
                  </motion.div>
                ))}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    Next
                  </Button>
                </motion.div>
              </nav>
            </div>
          </FadeInUp>
        )}
    </div>
  );
}
