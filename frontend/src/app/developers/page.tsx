'use client';

import { useState, useEffect } from 'react';
import { getDevelopers } from '@/services/developerService';
import DeveloperCard from '@/components/developers/DeveloperCard';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { motion } from 'framer-motion';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrapper';

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
        <FadeInUp className="mb-8">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Real Estate Developers
          </motion.h1>
          <motion.p
            className="text-gray-600 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Explore top real estate developers in Dubai & UAE
          </motion.p>
        </FadeInUp>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              className="rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : error ? (
          <FadeInUp>
            <ErrorDisplay message={error} />
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8" delay={0.05}>
            {developers.map((developer: any) => (
              <StaggerItem key={developer.id}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <DeveloperCard
                    id={developer.id}
                    name={developer.name}
                    logo={developer.logo}
                    backgroundImage={developer.backgroundImage}
                    slug={developer.slug}
                    featured={developer.featured}
                    description={developer.description}
                  />
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
