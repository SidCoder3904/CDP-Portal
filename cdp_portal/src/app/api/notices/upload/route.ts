import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid Authorization header found');
      return NextResponse.json(
        { error: 'Not authenticated. Please login again.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Forward the file to your backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    console.log('Sending request to:', `${backendUrl}/api/notices/upload`);

    const response = await fetch(`${backendUrl}/api/notices/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend upload error:', errorText);
      throw new Error(errorText || 'Failed to upload to backend');
    }

    // Get the raw response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing response:', e);
      console.error('Response text that failed to parse:', responseText);
      throw new Error('Invalid response from server');
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
} 