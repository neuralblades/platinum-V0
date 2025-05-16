"use client";

import Image from 'next/image';
import Link from 'next/link';
import { getFullImageUrl, handleImageError } from '@/utils/imageUtils';
import { getResponsiveSizes } from '@/utils/imageOptimizationUtils';
import { FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bedroomRange?: string; // Optional bedroom range for offplan properties
  bathrooms: number;
  area: number;
  imageUrl: string;
  featured?: boolean;
  isOffplan?: boolean;
  yearBuilt?: number | string; // For offplan handover year
  paymentPlan?: string; // For offplan payment plan
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  };
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  bedrooms,
  bedroomRange,
  bathrooms,
  area,
  imageUrl,
  featured = false,
  isOffplan = false,
  yearBuilt,
  paymentPlan,
}: PropertyCardProps) => {

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      whileHover={{
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        y: featured ? -8 : -4
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15
      }}
    >
      <Link href={isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}>
        <div className="relative h-64 w-full">
          <Image
            src={getFullImageUrl(imageUrl)}
            alt={title}
            fill
            className="object-cover"
            sizes={getResponsiveSizes('card')}
            quality={80}
            loading={featured ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF+wHAAAAABJRU5ErkJggg=="
            onError={handleImageError}
          />
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {featured && (
              <motion.div
                className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Featured
              </motion.div>
            )}
            {isOffplan && (
              <motion.div
                className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
              >
                Off Plan
              </motion.div>
            )}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}>
          <motion.h3
            className="text-xl font-bold text-gray-800 mb-2"
            whileHover={{ color: "#4B5563" }}
          >
            {title}
          </motion.h3>
        </Link>

        <motion.p
          className="text-gray-600 mb-2 flex items-center"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </motion.p>

        <motion.p
          className="text-2xl font-bold text-gray-700 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          AED {typeof price === 'number' ? price.toLocaleString() : Number(price).toLocaleString()}
        </motion.p>

        <motion.div
          className="flex justify-between text-gray-600 border-t pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.div
            className="flex items-center"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>
              {isOffplan && bedroomRange
                ? `${bedroomRange} Beds`
                : `${bedrooms} ${bedrooms === 1 ? 'Bed' : 'Beds'}`
              }
            </span>
          </motion.div>

          {isOffplan ? (
            <motion.div
              className="flex items-center"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Handover {yearBuilt || 'TBA'}</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {(() => {
                  // Convert to number first to handle string inputs
                  const bathroomsNum = typeof bathrooms === 'string' ? parseFloat(bathrooms) : bathrooms;
                  // Format based on whether it's an integer
                  const formattedBathrooms = Number.isInteger(bathroomsNum) ?
                    bathroomsNum :
                    bathroomsNum.toFixed(1).replace('.0', '');
                  return `${formattedBathrooms} ${bathroomsNum === 1 ? 'Bath' : 'Baths'}`;
                })()}
              </span>
            </motion.div>
          )}

          {isOffplan ? (
            <motion.div
              className="flex items-center"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{paymentPlan || '60/40'} Plan</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              <span>{area} sqft</span>
            </motion.div>
          )}
        </motion.div>

        {/* Contact Buttons */}
        <motion.div
          className="mt-4 pt-4 border-t border-gray-200 flex justify-between gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {/* WhatsApp Button */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              href={`https://wa.me/971585359315?text=${encodeURIComponent(`I'm interested in this property: ${title} (ID: ${id}). Please provide more information. ${typeof window !== 'undefined' ? window.location.origin : ''}${isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}`)}`}
              variant="accent"
              size="sm"
              className="w-full"
            >
              <FaWhatsapp className="mr-1" />
              <span className="text-sm">WhatsApp</span>
            </Button>
          </motion.div>

          {/* Call Button */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              href="tel:+971585359315"
              variant="mj"
              size="sm"
              className="w-full"
            >
              <FaPhone className="mr-1" />
              <span className="text-sm">Call</span>
            </Button>
          </motion.div>

          {/* Email Button */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              href={`mailto:info@platinumsquare.ae?subject=Inquiry about ${title} (ID: ${id})&body=I'm interested in this property: ${title} (ID: ${id}). Please provide more information. ${typeof window !== 'undefined' ? window.location.origin : ''}${isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}`}
              variant="accent"
              size="sm"
              className="w-full"
            >
              <FaEnvelope className="mr-1" />
              <span className="text-sm">Email</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
