import { NextRequest } from 'next/server';
import { API_BASE_URL, fetchFromApi } from '../utils';

/**
 * Proxy route handler for properties
 * This allows us to avoid CORS issues by proxying requests through the Next.js server
 */
export async function GET(request: NextRequest) {
  // Get the query parameters
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // Construct the full URL
  const url = `${API_BASE_URL}/api/properties${queryString ? `?${queryString}` : ''}`;

  return fetchFromApi(url, 'Failed to fetch properties');
}
