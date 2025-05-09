'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
// Auth context not needed for this component
import { getPropertyById, Property as BaseProperty } from '@/services/propertyService';
import { submitOffplanInquiry } from '@/services/offplanInquiryService';

// Extended Property interface with headerImage, completionDate, and paymentPlan
interface Property extends BaseProperty {
  headerImage?: string;
  completionDate?: string;
  paymentPlan?: string;
}
import { getDeveloperById, Developer } from '@/services/developerService';
import { getFullImageUrl } from '@/utils/imageUtils';
import { Dialog, Transition } from '@headlessui/react';
import MapComponent from '@/components/maps/MapComponent';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import ContactFormPopup from '@/components/ContactFormPopup';

// Client component wrapper
function OffplanPropertyDetailClient({ propertyId }: { propertyId: string }) {
  // No auth needed for this component
  const [property, setProperty] = useState<Property | null>(null);
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Photo gallery modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  // Offplan inquiry form state
  const [offplanFormData, setOffplanFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguage: 'english',
    message: '',
    interestedInMortgage: false
  });
  const [offplanFormSubmitting, setOffplanFormSubmitting] = useState(false);
  const [offplanFormSuccess, setOffplanFormSuccess] = useState(false);
  const [offplanFormError, setOffplanFormError] = useState<string | null>(null);

  // Contact form popup states
  const [isContactFormOpen, setIsContactFormOpen] = useState<boolean>(false);
  const [contactFormType, setContactFormType] = useState<'brochure' | 'floorplan'>('brochure');

  // Handle offplan form changes
  const handleOffplanFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setOffplanFormData(prev => ({
        ...prev,
        [id]: checked
      }));
    } else {
      setOffplanFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  // Handle offplan form submission
  const handleOffplanInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOffplanFormSubmitting(true);
    setOffplanFormError(null);

    try {
      // Format phone number with country code if not already included
      const formattedPhone = offplanFormData.phone.startsWith('+')
        ? offplanFormData.phone
        : `+971${offplanFormData.phone}`;

      const response = await submitOffplanInquiry({
        propertyId,
        propertyTitle: property?.title,
        name: offplanFormData.name,
        email: offplanFormData.email,
        phone: formattedPhone,
        preferredLanguage: offplanFormData.preferredLanguage,
        message: offplanFormData.message,
        interestedInMortgage: offplanFormData.interestedInMortgage
      });

      if (response.success) {
        setOffplanFormSuccess(true);
        // Reset form after successful submission
        setOffplanFormData({
          name: '',
          email: '',
          phone: '',
          preferredLanguage: 'english',
          message: '',
          interestedInMortgage: false
        });
      } else {
        setOffplanFormError(response.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting offplan inquiry:', error);
      setOffplanFormError('An unexpected error occurred. Please try again.');
    } finally {
      setOffplanFormSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        // Validate ID before making the request
        if (!propertyId) {
          setError('Invalid property ID');
          setLoading(false);
          return;
        }

        // Fetch property data
        const response = await getPropertyById(propertyId);
        if (response.success && response.property) {
          const propertyData = response.property;

          // Check if it's an offplan property
          if (!propertyData.isOffplan) {
            setError('This is not an offplan property');
            setLoading(false);
            return;
          }

          setProperty(propertyData);

          // Fetch developer data if available
          if (propertyData.developer && propertyData.developer.id) {
            try {
              const devResponse = await getDeveloperById(propertyData.developer.id);
              if (devResponse.success && devResponse.developer) {
                setDeveloper(devResponse.developer);
              }
            } catch (err) {
              console.error('Error fetching developer details:', err);
            }
          }
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h1>
        <p className="text-gray-600 mb-8">{error || 'The property you are looking for does not exist or has been removed.'}</p>
        <Link href="/properties/offplan" className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-md hover:shadow-lg transition duration-300">
          Browse All Offplan Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section - Full Width Header Image with Modern Design */}
      <div className="relative h-[90vh] w-full">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0 transform transition-transform duration-1000 ease-out">
          <Image
            src={property.headerImage ? getFullImageUrl(property.headerImage) :
                 (property.images && property.images.length > 0 ? getFullImageUrl(property.images[0]) : '/images/default-property.jpg')}
            alt={property.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority

          />
          {/* Modern Gradient Overlay - Enhanced for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/90"></div>
        </div>

        {/* Breadcrumbs with Frosted Glass Effect */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10">
          <div className="container mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Off Plan', href: '/properties/offplan' },
                  { label: property.title }
                ]}
                darkMode={true}
              />
            </div>
          </div>
        </div>

        {/* Content with Modern Layout */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-24 relative z-10 text-white">
            <div className="max-w-5xl">
              {/* Property Tags */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-1.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-sm font-medium rounded-full uppercase tracking-wider shadow-lg">
                  {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                </span>
                <span className="px-4 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-medium rounded-full uppercase tracking-wider shadow-lg">
                  Offplan
                </span>
                <span className="px-4 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-medium rounded-full uppercase tracking-wider shadow-lg">
                  {property.propertyType}
                </span>
              </div>

              {/* Property Title with Animation */}
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{property.title}</h1>

              {/* Location with Icon */}
              <div className="flex items-center text-white/90 mb-6">
                <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xl">{property.location}</p>
              </div>

              {/* Developer Info with Modern Design */}
              {developer && (
                <div className="mb-10 flex items-center">
                  {developer.logo ? (
                    <div className="relative h-16 w-24 mr-4 overflow-hidden bg-white p-2 rounded-lg border border-gray-400 shadow-lg">
                      <Image
                        src={getFullImageUrl(developer.logo)}
                        alt={developer.name}
                        fill
                        className="object-contain bg-white"
                        sizes="96px"

                      />
                    </div>
                  ) : (
                    <div className="h-16 w-24 mr-4 rounded-lg bg-gray-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {developer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-300 text-sm">Developed by</span>
                    <h3 className="text-2xl font-semibold">{developer.name}</h3>
                  </div>
                </div>
              )}

              {/* Action Buttons with Modern Design */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setIsGalleryOpen(true);
                    setCurrentPhotoIndex(0);
                  }}
                  className="px-8 py-4 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Gallery
                </button>
                <a
                  href="#inquiry-form"
                  className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-lg hover:from-gray-800 hover:to-black transition duration-300 shadow-lg flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Register Interest
                </a>
                  <button
                    onClick={() => {
                      setContactFormType('brochure');
                      setIsContactFormOpen(true);
                    }}
                    className="px-8 py-4 border border-white/50 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/20 transition duration-300 shadow-lg flex items-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Brochure
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Header - Key Information */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col p-8 hover:bg-gray-50 transition-colors duration-300">
              <h3 className="text-sm uppercase text-gray-500 mb-2 tracking-wider font-medium">STARTING PRICE</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">AED {typeof property.price === 'number' ? property.price.toLocaleString() : Number(property.price).toLocaleString()}</p>
            </div>
            <div className="flex flex-col p-8 hover:bg-gray-50 transition-colors duration-300">
              <h3 className="text-sm uppercase text-gray-500 mb-2 tracking-wider font-medium">HANDOVER</h3>
              <p className="text-4xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{property.yearBuilt}</p>
            </div>
            <div className="flex flex-col p-8 hover:bg-gray-50 transition-colors duration-300">
              <h3 className="text-sm uppercase text-gray-500 mb-2 tracking-wider font-medium">PAYMENT PLAN</h3>
              <p className="text-4xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{property.paymentPlan || '70/30'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          {/* Project Details */}
          <div className="w-full">
            {/* Tabs Navigation */}
            <TabGroup>
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <TabList className="flex overflow-x-auto scrollbar-hide">
                  <Tab className={({ selected }) =>
                    `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 ${selected ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Details
                    </div>
                  </Tab>
                  <Tab className={({ selected }) =>
                    `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 ${selected ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Gallery
                    </div>
                  </Tab>
                  <Tab className={({ selected }) =>
                    `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 ${selected ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Floor Plans
                    </div>
                  </Tab>
                  <Tab className={({ selected }) =>
                    `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 ${selected ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Amenities
                    </div>
                  </Tab>
                  <Tab className={({ selected }) =>
                    `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 ${selected ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </div>
                  </Tab>
                  <Tab className={({ selected }) =>
                    `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 ${selected ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Payment Plans
                    </div>
                  </Tab>
                  <Tab className={({ selected }) =>
                    `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 ${selected ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Brochure
                    </div>
                  </Tab>
                </TabList>
              </div>

              <TabPanels>
                {/* Details Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Column - Project Description */}
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">ABOUT THIS PROJECT</h2>
                          <div className="w-20 h-1 bg-gray-700 mb-6"></div>

                          {/* Project Introduction */}
                          <div className="prose max-w-none text-gray-700 mb-8">
                            <div className="text-lg">
                              <p className="text-xl font-medium text-gray-800 mb-6">
                                Discover refined living at {property.title}, a sophisticated residential development located in {property.location}.
                              </p>
                              <p className="mb-6">
                                {developer && `Developed by ${developer.name}, this distinguished project offers a collection of meticulously crafted ${property.bedroomRange || property.bedrooms}-bedroom ${property.propertyType}s.`}
                              </p>

                              {/* Property Description */}
                              <div className="whitespace-pre-line">
                                {property.description && property.description.split('\n').map((paragraph, index) => (
                                  <p key={index} className="mb-4">{paragraph}</p>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Property Features */}
                          <div className="mt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {property.features && property.features.slice(0, 6).map((feature, index) => (
                                <div key={index} className="flex items-start">
                                  <div className="flex-shrink-0 mt-1">
                                    <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  <p className="ml-3 text-gray-700">{feature}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Property Details */}
                        <div className="lg:w-80 mt-8 lg:mt-0">
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Project Details</h3>

                            {/* Starting Price */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">STARTING PRICE</h4>
                              <p className="text-3xl font-bold text-gray-800">AED {property.price ? (typeof property.price === 'number' ? property.price.toLocaleString() : Number(property.price).toLocaleString()) : '0'}</p>
                            </div>

                            {/* Handover */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">HANDOVER</h4>
                              <p className="text-2xl font-bold text-gray-800">{property.yearBuilt || '2025'}</p>
                            </div>

                            {/* Payment Plan */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">PAYMENT PLAN</h4>
                              <p className="text-2xl font-bold text-gray-800">{property.paymentPlan || '60/40'}</p>
                            </div>

                            {/* Property Type */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">PROPERTY TYPE</h4>
                              <p className="text-lg font-medium text-gray-800 capitalize">{property.propertyType}</p>
                            </div>

                            {/* Bedrooms */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">BEDROOMS</h4>
                              <p className="text-lg font-medium text-gray-800">{property.bedroomRange || property.bedrooms}</p>
                            </div>

                            {/* Developer */}
                            {developer && (
                              <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">DEVELOPER</h4>
                                <div className="flex items-center">
                                  {developer.logo ? (
                                    <div className="relative h-10 w-16 mr-3 bg-white p-1 rounded border border-gray-200">
                                      <Image
                                        src={getFullImageUrl(developer.logo)}
                                        alt={developer.name}
                                        fill
                                        className="object-contain"

                                      />
                                    </div>
                                  ) : null}
                                  <p className="text-lg font-medium text-gray-800">{developer.name}</p>
                                </div>
                              </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="space-y-3 mt-4">
                              <button
                                onClick={() => setIsContactFormOpen(true)}
                                className="w-full py-3 px-6 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
                              >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Request Information
                              </button>

                              <a
                                href={`https://wa.me/971585602665?text=I'm interested in ${property?.title || 'this offplan property'} (ID: ${propertyId})`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
                              >
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp Inquiry
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Gallery Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Gallery</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {property.images && property.images.map((image, index) => (
                          <div
                            key={index}
                            className="group relative h-64 cursor-pointer rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                            onClick={() => {
                              setIsGalleryOpen(true);
                              setCurrentPhotoIndex(index);
                            }}
                          >
                            <Image
                              src={getFullImageUrl(image)}
                              alt={`Property Image ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                              <div className="p-4 w-full">
                                <span className="text-white font-medium">View Image {index + 1}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setIsGalleryOpen(true)}
                          className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          View Full Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Floor Plans Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Floor Plans</h2>
                      <div className="bg-gray-100 rounded-xl p-8 text-center">
                        <div className="mb-6">
                          <svg className="h-16 w-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Floor Plans Available Upon Request</h3>
                          <p className="text-gray-700 max-w-2xl mx-auto">Detailed floor plans for this property are available. Please contact our sales team or fill out the inquiry form to receive the complete floor plans package.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setContactFormType('floorplan');
                              setIsContactFormOpen(true);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center"
                          >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Request Floor Plans
                          </button>

                          <a
                            href={`https://wa.me/971585602665?text=I would like to request the floor plans for ${property?.title || 'this offplan property'} (ID: ${propertyId})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-lg transition-all duration-300 inline-flex items-center"
                          >
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp for Floor Plans
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Amenities Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {property.features && property.features.map((feature, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center">
                              <div className="bg-gray-200 p-3 rounded-full mr-3">
                                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="font-medium text-gray-800">{feature}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Location Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Location</h2>
                      <div className="rounded-xl overflow-hidden mb-6">
                        <MapComponent
                          address={property.address || ''}
                          location={property.location || ''}
                          height="400px"
                          zoom={14}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-xl font-semibold mb-4">Property Address</h3>
                          <div className="flex items-start">
                            <div className="bg-gray-200 p-2 rounded-full mr-3 mt-1">
                              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-700">{property.address}</p>
                              <p className="text-gray-700">{property.city}, {property.state} {property.zipCode}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-xl font-semibold mb-4">Neighborhood</h3>
                          <div className="flex items-start">
                            <div className="bg-gray-200 p-2 rounded-full mr-3 mt-1">
                              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-700">{property.location}</p>
                              <p className="text-sm text-gray-500 mt-1">A prime location with excellent connectivity and amenities.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Payment Plans Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Plans</h2>

                      <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="flex items-center mb-4">
                          <div className="bg-gray-200 p-3 rounded-full mr-4">
                            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">{property.paymentPlan || '70/30'} Payment Plan</h3>
                        </div>

                        <div className="mt-6">
                          {property.paymentPlan === '60/40' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">During Construction (60%)</h4>
                                <ul className="space-y-3">
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">1</span>
                                    </div>
                                    <span>10% on booking</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">2</span>
                                    </div>
                                    <span>10% after 30 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">3</span>
                                    </div>
                                    <span>10% after 60 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">4</span>
                                    </div>
                                    <span>10% after 90 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">5</span>
                                    </div>
                                    <span>10% after 120 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">6</span>
                                    </div>
                                    <span>10% after 150 days</span>
                                  </li>
                                </ul>
                              </div>
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">On Completion (40%)</h4>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900 mb-2">40%</div>
                                    <p className="text-gray-800">Final payment upon handover</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : property.paymentPlan === '50/50' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">During Construction (50%)</h4>
                                <ul className="space-y-3">
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">1</span>
                                    </div>
                                    <span>10% on booking</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">2</span>
                                    </div>
                                    <span>10% after 30 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">3</span>
                                    </div>
                                    <span>10% after 60 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">4</span>
                                    </div>
                                    <span>10% after 90 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">5</span>
                                    </div>
                                    <span>10% after 120 days</span>
                                  </li>
                                </ul>
                              </div>
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">On Completion (50%)</h4>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900 mb-2">50%</div>
                                    <p className="text-gray-800">Final payment upon handover</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">During Construction (70%)</h4>
                                <ul className="space-y-3">
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">1</span>
                                    </div>
                                    <span>10% on booking</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">2</span>
                                    </div>
                                    <span>10% after 30 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">3</span>
                                    </div>
                                    <span>10% after 60 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">4</span>
                                    </div>
                                    <span>10% after 90 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">5</span>
                                    </div>
                                    <span>10% after 120 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">6</span>
                                    </div>
                                    <span>10% after 150 days</span>
                                  </li>
                                  <li className="flex items-center">
                                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-gray-800 text-sm font-medium">7</span>
                                    </div>
                                    <span>10% after 180 days</span>
                                  </li>
                                </ul>
                              </div>
                              <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">On Completion (30%)</h4>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900 mb-2">30%</div>
                                    <p className="text-gray-800">Final payment upon handover</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="bg-gray-200 p-2 rounded-full mr-3">
                            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold">Payment Plan Information</h3>
                        </div>
                        <p className="text-gray-700 ml-10">For more details about our payment plans or to discuss custom payment options, please contact our sales team.</p>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Brochure Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Brochure</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                          <div className="bg-gray-100 rounded-xl p-6 mb-6">
                            <div className="flex items-center mb-4">
                              <div className="bg-gray-200 p-2 rounded-full mr-3">
                                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold">Complete Project Information</h3>
                            </div>
                            <p className="text-gray-700 ml-10">Our detailed brochure includes floor plans, payment schedules, amenities list, and more information about this exclusive development.</p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Request Your Copy</h3>
                            <p className="text-gray-700 mb-6">Fill out the form to receive the complete brochure for {property.title} directly to your email.</p>
                              <button
                                onClick={() => {
                                  setContactFormType('brochure');
                                  setIsContactFormOpen(true);
                                }}
                                className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                              >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Brochure
                              </button>
                          </div>
                        </div>

                        <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={property.headerImage ? getFullImageUrl(property.headerImage) :
                                (property.images && property.images.length > 0 ? getFullImageUrl(property.images[0]) : '/images/default-property.jpg')}
                            alt="Brochure Cover"
                            fill
                            className="object-cover"

                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                            <div className="p-6 text-white">
                              <h3 className="text-2xl font-bold mb-2">{property.title}</h3>
                              <p className="text-sm opacity-90">{property.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>

          {/* Contact Information - Register Interest Section */}
          <div className="w-full">
            <div className="relative rounded-xl shadow-xl overflow-hidden">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/banner.webp"
                  alt="Contact Section Background"
                  fill
                  className="object-cover"

                />
                {/* Keep the gradient overlay on top of the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 opacity-65"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 relative z-10">
                {/* Left side - Text content */}
                <div className="flex flex-col justify-center text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">The best deals are our expertise – register now.</h2>
                  <p className="text-lg mb-6 opacity-90">Partner with Dubai's Leading Real Estate Agency Since 2008. Share your details, and our off-plan property expert will call you back within just 55 seconds.</p>
                  <div className="flex flex-wrap gap-4">
                    <a href="tel:+971585602665" className="flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition duration-300 font-medium">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Request a Call Back Now
                    </a>
                    <a
                      href={`https://wa.me/971585602665?text=I'm interested in ${property?.title || 'this offplan property'} (ID: ${propertyId})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 font-medium"
                    >
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Right side - Contact Form - Styled to match the image */}
                <div className="relative bg-white rounded-lg shadow-lg p-6 transform transition-transform duration-300 hover:shadow-xl overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Register Your Interest</h3>
                    <p className="text-gray-600 mb-6">Fill out the form below and our property consultant will get in touch with you shortly.</p>

                    <form className="space-y-4" onSubmit={handleOffplanInquirySubmit}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                        placeholder="Your name"
                        value={offplanFormData.name}
                        onChange={handleOffplanFormChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg shadow-sm">
                          <span className="text-gray-500 text-sm">+971</span>
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                          placeholder="Phone number"
                          value={offplanFormData.phone}
                          onChange={handleOffplanFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                        placeholder="Your email"
                        value={offplanFormData.email}
                        onChange={handleOffplanFormChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                      <select
                        id="preferredLanguage"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none bg-white shadow-sm"
                        value={offplanFormData.preferredLanguage}
                        onChange={handleOffplanFormChange}
                      >
                        <option value="english">English</option>
                        <option value="arabic">Arabic</option>
                        <option value="russian">Russian</option>
                        <option value="chinese">Chinese</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        id="message"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                        placeholder="Your message"
                        value={offplanFormData.message}
                        onChange={handleOffplanFormChange}
                      ></textarea>
                    </div>

                    <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        id="interestedInMortgage"
                        className="h-5 w-5 text-gray-700 focus:ring-gray-500 border-gray-300 rounded"
                        checked={offplanFormData.interestedInMortgage}
                        onChange={handleOffplanFormChange}
                      />
                      <label htmlFor="interestedInMortgage" className="ml-2 block text-sm text-gray-700">
                        I'm interested in mortgage advice
                      </label>
                    </div>

                    {offplanFormError && (
                      <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{offplanFormError}</div>
                    )}
                    {offplanFormSuccess && (
                      <div className="text-green-500 text-sm bg-green-50 p-3 rounded-lg">Thank you for your interest! Our team will contact you shortly.</div>
                    )}

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-lg hover:shadow-lg transition duration-300 shadow-md text-lg"
                      disabled={offplanFormSubmitting}
                    >
                      {offplanFormSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Register your Interest'
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-2">
                      By clicking Submit, you agree to our <a href="#" className="text-gray-700 hover:underline">Terms & Conditions</a> and <a href="#" className="text-gray-700 hover:underline">Privacy Policy</a>
                    </p>
                  </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <Transition show={isGalleryOpen} as={React.Fragment}>
        <Dialog
          open={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          className="relative z-50"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center">
              <div className="w-full max-w-6xl transform overflow-hidden transition-all">
                {/* Close button */}
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Main Image */}
                <div className="relative h-[80vh] w-full">
                  {property.images && property.images.length > 0 && (
                    <Image
                      src={getFullImageUrl(property.images[currentPhotoIndex])}
                      alt={`Property Image ${currentPhotoIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority

                    />
                  )}

                  {/* Navigation Buttons - Positioned on sides */}
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Image Counter and Thumbnails */}
                <div className="bg-black/80 text-white p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">
                      {property.title}
                    </h3>
                    <span className="text-sm bg-black/50 px-3 py-1 rounded-full">
                      {currentPhotoIndex + 1} / {property.images.length}
                    </span>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black/20">
                    {property.images && property.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md transition-all duration-200 ${index === currentPhotoIndex ? 'ring-2 ring-gray-400 scale-105' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <Image
                          src={getFullImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"

                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Contact Form Popup */}
      <ContactFormPopup
        isOpen={isContactFormOpen}
        closeModal={() => setIsContactFormOpen(false)}
        title={contactFormType === 'brochure' ? 'Download the Brochure' : 'Request Floor Plans'}
        propertyTitle={property.title}
        propertyId={propertyId}
        requestType={contactFormType}
      />
    </div>
  );
}

// Server component that passes the ID to the client component
export default function OffplanPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use() to unwrap the params object
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.id;
  return <OffplanPropertyDetailClient propertyId={propertyId} />;
}
