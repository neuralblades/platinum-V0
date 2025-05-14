'use client';

import React, { useState, useEffect } from 'react';
import { getProperties, PropertyFilter } from '@/services/propertyService';
import PropertyMapView from '../../../components/maps/PropertyMapView';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Button from '@/components/ui/Button';


interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  address?: string;
  bedrooms: number;
  bedroomRange?: string;
  bathrooms: number;
  area: number;
  mainImage: string;
  featured?: boolean;
  isOffplan?: boolean;
  yearBuilt?: number | string;
  paymentPlan?: string;
  latitude?: number;
  longitude?: number;
}

export default function PropertiesMapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOffplan = searchParams.get('isOffplan') === 'true';

  const handleGoBack = () => {
    if (isOffplan) {
      router.push('/properties/offplan');
    } else {
      router.push('/properties');
    }
  };

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Simple filters for API call
  const [filters] = useState<PropertyFilter>({
    page: 1,
    limit: 50, // Show more properties on the map
    isOffplan: isOffplan
  });

  // Fetch properties with current filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await getProperties(filters);
      if (response.success && response.properties.length > 0) {
        setProperties(response.properties);
      } else {
        console.log('No properties returned from API');
        setProperties([]);
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

  // No filter functions needed anymore

  // Handle property selection from map
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-full h-full relative">
        {/* Back button */}
        <Button
          onClick={handleGoBack}
          className="absolute top-4 left-4 z-10 !p-3 !rounded-full"
          variant="wht"
          size="sm"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-gray-700" />
        </Button>

        {/* Full-width map view */}
        <div className="w-full h-full">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-red-600">{error}</div>
          ) : properties.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-600">
              No properties found matching your criteria.
            </div>
          ) : (
            <PropertyMapView
              properties={properties}
              onPropertySelect={handlePropertySelect}
              selectedProperty={selectedProperty}
            />
          )}
        </div>
      </div>
    </div>
  );
}
