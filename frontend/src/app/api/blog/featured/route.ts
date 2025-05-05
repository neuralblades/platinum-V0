import { NextRequest } from 'next/server';
import { API_BASE_URL, fetchFromApi } from '../../utils';

/**
 * Proxy route handler for featured blog posts
 * This allows us to avoid CORS issues by proxying requests through the Next.js server
 */
export async function GET(request: NextRequest) {
  // Get the limit from the query parameters
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '3';

  // Construct the full URL
  const url = `${API_BASE_URL}/api/blog/featured?limit=${limit}`;

  return fetchFromApi(url, 'Failed to fetch featured blog posts');
}
