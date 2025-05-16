import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '../../utils';

/**
 * Proxy route handler to clear server cache
 * This allows us to clear the cache for specific keys or all keys
 */
export async function POST(request: NextRequest) {
  try {
    // Get the key from the request body
    const body = await request.json();
    const { key } = body;

    // Construct the full URL
    const url = `${API_BASE_URL}/api/cache/clear`;

    // Make the request to the backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to clear cache' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
