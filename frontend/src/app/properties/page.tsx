"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import IntegratedSearchFilters from '@/components/search/IntegratedSearchFilters';
import { getProperties, PropertyFilter, Property } from '@/services/propertyService';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';



export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter states
  const [filters, setFilters] = useState<PropertyFilter>({
    page: 1,
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minArea: searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined,
    maxArea: searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
    yearBuilt: searchParams.get('yearBuilt') ? Number(searchParams.get('yearBuilt')) : undefined,
    keyword: searchParams.get('keyword') || '',
    isOffplan: false, // Explicitly exclude offplan properties
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
        // If API returns empty, keep using fallback data
        console.log('No properties returned from API, using fallback data');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
      // Keep using fallback data
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
    // Always maintain isOffplan: false to exclude offplan properties
    setFilters({ ...newFilters, isOffplan: false });
  };

  // Apply filters
  const applyFilters = () => {
    fetchProperties();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilters({ ...filters, page, isOffplan: false });
    fetchProperties();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Properties' }
          ]}
        />
      </div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse Properties</h1>
        <p className="text-gray-600 mb-4">
          Explore our collection of premium properties in the most desirable locations.
        </p>
        <div className="flex space-x-4">
          <Button
            href="/properties"
            variant="accent"
            size="lg"
          >
            Ready Properties
          </Button>
          <Button
            href="/properties/offplan"
            variant="outline"
            size="lg"
          >
            Off Plan Properties
          </Button>
          <Button
            href="/properties/map"
            variant="outline"
            size="lg"
          >
            Map View
          </Button>
        </div>
      </div>

      {/* Integrated Search and Filters */}
      <div className="mb-8">
        <IntegratedSearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          className="w-full"
        />
      </div>

      {/* Property Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mb-8">{error}</div>
      ) : properties.length === 0 ? (
        <div className="text-center text-gray-600 mb-8">No properties found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              price={property.price}
              location={property.location}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={property.area}
              imageUrl={property.mainImage}
              featured={property.featured}
              agent={property.agent}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Show first page, last page, current page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? "primary" : "outline"}
                    size="sm"
                    className="mx-1"
                  >
                    {page}
                  </Button>
                );
              } else if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                // Show ellipsis
                return <span key={page} className="px-4 py-2 text-gray-700">...</span>;
              }
              return null;
            })}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="ml-1"
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
