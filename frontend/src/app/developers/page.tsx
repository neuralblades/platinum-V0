'use client';

import { useState, useEffect } from 'react';
import { getDevelopers } from '@/services/developerService';
import DeveloperCard from '@/components/developers/DeveloperCard';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        setLoading(true);
        const response = await getDevelopers();
        setDevelopers(response.developers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching developers:', err);
        setError('Failed to load developers. Please try again later.');
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Developers' }
            ]}
          />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Real Estate Developers</h1>
          <p className="text-gray-600 mb-4">
            Explore top real estate developers in Dubai & UAE
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {developers.map((developer: any) => (
              <DeveloperCard
                key={developer.id}
                id={developer.id}
                name={developer.name}
                logo={developer.logo}
                backgroundImage={developer.backgroundImage}
                slug={developer.slug}
                featured={developer.featured}
                description={developer.description}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
