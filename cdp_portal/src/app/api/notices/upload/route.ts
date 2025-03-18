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

    // Get the JWT token from cookies
    // const cookieStore = await cookies();
    // const token = cookieStore.get('jwt_token')?.value;

    // if (!token) {
    //   console.error('No JWT token found in cookies');
    //   return NextResponse.json(
    //     { error: 'Not authenticated. Please login again.' },
    //     { status: 401 }
    //   );
    // }

    // Forward the file to your backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch(`${backendUrl}/api/notices/upload`, {
      method: 'POST',
      // headers: {
      //   'Authorization': `Bearer ${token}`,
      // },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend upload error:', errorText);
      throw new Error(errorText || 'Failed to upload to backend');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 