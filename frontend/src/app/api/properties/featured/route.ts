import { NextRequest } from 'next/server';
import { API_BASE_URL, fetchFromApi } from '../../utils';

/**
 * Proxy route handler for featured properties
 * This allows us to avoid CORS issues by proxying requests through the Next.js server
 */
export async function GET(_request: NextRequest) {
  const url = `${API_BASE_URL}/api/properties/featured`;
  return fetchFromApi(url, 'Failed to fetch featured properties');
}
