import { NextRequest } from 'next/server';
import { API_BASE_URL, fetchFromApi } from '../../utils';

/**
 * Proxy route handler for property details
 * This allows us to avoid CORS issues by proxying requests through the Next.js server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Extract the id from params
  const id = params.id;

  // Get the query parameters
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // Construct the full URL
  const url = `${API_BASE_URL}/api/properties/${id}${queryString ? `?${queryString}` : ''}`;

  // Use the fetchFromApi utility to make the request
  return fetchFromApi(url, 'Failed to fetch property details');
}
