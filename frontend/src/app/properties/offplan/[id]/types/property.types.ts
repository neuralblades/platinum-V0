// types/property.types.ts
export interface Property {
    id: string;
    title: string;
    description: string;
    price: number | string;
    location: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    propertyType: string;
    status: 'for-sale' | 'for-rent';
    bedrooms?: number;
    bathrooms?: number;
    bedroomRange?: string;
    images: string[];
    headerImage?: string;
    features?: string[];
    yearBuilt?: string;
    paymentPlan?: string;
    isOffplan: boolean;
    developer?: {
      id: string;
      name: string;
    };
    completionDate?: string;
  }
  
  export interface Developer {
    id: string;
    name: string;
    logo?: string;
    description?: string;
  }
  
  export interface OffplanFormData {
    name: string;
    email: string;
    phone: string;
    preferredLanguage: string;
    message: string;
    interestedInMortgage: boolean;
  }