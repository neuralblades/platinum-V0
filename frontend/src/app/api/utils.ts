import { NextResponse } from 'next/server';

// API base URL - remove '/api' if it exists at the end
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

/**
 * Fetch data from the backend API and handle errors
 * @param url The URL to fetch from
 * @param errorMessage The error message to display if the request fails
 * @returns The response data
 */
export async function fetchFromApi(url: string, errorMessage: string) {
  try {
    console.log('Fetching from URL:', url);

    // Fetch the resource from the backend
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    // If the response is not OK, return an error
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.statusText}`);

      // Try to get more detailed error information
      let errorDetail = '';
      try {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        errorDetail = errorData;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }

      return NextResponse.json(
        {
          success: false,
          message: `${errorMessage}: ${response.statusText}`,
          detail: errorDetail
        },
        { status: response.status }
      );
    }

    // Parse the response data
    const data = await response.json();

    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error: ${errorMessage}`, error);
    return NextResponse.json(
      {
        success: false,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
