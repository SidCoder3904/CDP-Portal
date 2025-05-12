"use client"

import { Download, FileText, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

interface Notice {
  _id: string;
  title: string;
  description?: string;
  link: string;
  content?: string;
  type?: string;
  company?: string;
  date: string;
}

export default function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingPdf, setViewingPdf] = useState<{url: string, title: string} | null>(null);

  // Parse notices data from different API response formats
  const parseNoticesResponse = (data: any): Notice[] => {
    if (!data) return []
    
    // Handle array format
    if (Array.isArray(data)) {
      return data.map((notice: any, index: number) => ({
        _id: notice._id || notice.id || `temp-id-${index}`,
        title: notice.title || "Untitled Notice",
        description: notice.description || "",
        link: notice.link || "",
        content: notice.content || notice.description || "",
        company: notice.company || "",
        type: notice.type || "",
        date: notice.date || new Date().toISOString().split('T')[0],
      }))
    }
    
    // Handle {notices: [...]} format
    if (data.notices && Array.isArray(data.notices)) {
      return data.notices.map((notice: any, index: number) => ({
        _id: notice._id || notice.id || `temp-id-${index}`,
        title: notice.title || "Untitled Notice",
        description: notice.description || "",
        link: notice.link || "",
        content: notice.content || notice.description || "",
        company: notice.company || "",
        type: notice.type || "",
        date: notice.date || new Date().toISOString().split('T')[0],
      }))
    }
    
    return []
  }

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('access_token');
        console.log('Fetching notices for student view...');
        
        // Debug environment information
        console.log('Environment variables:');
        console.log('- NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('- Has token:', !!token);
        if (token) {
          console.log('- Token starts with:', token.substring(0, 10) + '...');
        }
        
        // Try to fetch from backend
        try {
          // The API endpoint should match the one used in admin page
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const noticesUrl = `${backendUrl}/notice/notices`;
          
          console.log('Attempting to fetch from:', noticesUrl);
          
          // Prepare headers based on token availability
          const headers: HeadersInit = {};
          if (token) {
            console.log('Using authorization header with token');
            headers['Authorization'] = `Bearer ${token}`;
          } else {
            console.log('No token available, fetching without authorization');
          }
          
          const response = await fetch(noticesUrl, {
            method: 'GET',
            headers,
          });
          
          if (!response.ok) {
            console.log(`Primary endpoint failed with status: ${response.status}`);
            throw new Error(`Backend returned status ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Notices loaded from backend:', data?.notices?.length || 0);
          setNotices(parseNoticesResponse(data));
        } catch (error) {
          console.error('Error fetching from primary endpoint:', error);
          
          // Try an alternative endpoint
          try {
            console.log('Trying alternative endpoint...');
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const alternativeUrl = `${backendUrl}/api/notices`;
            
            console.log('Attempting to fetch from:', alternativeUrl);
            
            const altResponse = await fetch(alternativeUrl, {
              method: 'GET',
              headers: token ? {
                'Authorization': `Bearer ${token}`,
              } : undefined,
            });
            
            if (!altResponse.ok) {
              console.log(`Alternative endpoint failed with status: ${altResponse.status}`);
              throw new Error(`Alternative backend returned status ${altResponse.status}`);
            }
            
            const altData = await altResponse.json();
            console.log('Notices loaded from alternative endpoint:', altData?.notices?.length || 0);
            setNotices(parseNoticesResponse(altData));
            return;
          } catch (altError) {
            console.error('Error fetching from alternative endpoint:', altError);
            
            // Try one more endpoint pattern
            try {
              console.log('Trying public endpoint...');
              const publicUrl = `${process.env.NEXT_PUBLIC_API_URL}/notice`;
              
              console.log('Attempting to fetch from:', publicUrl);
              
              const publicResponse = await fetch(publicUrl, {
                method: 'GET',
              });
              
              if (!publicResponse.ok) {
                console.log(`Public endpoint failed with status: ${publicResponse.status}`);
                throw new Error(`Public endpoint returned status ${publicResponse.status}`);
              }
              
              const publicData = await publicResponse.json();
              console.log('Notices loaded from public endpoint:', publicData?.length || publicData?.notices?.length || 0);
              setNotices(parseNoticesResponse(publicData));
              return;
            } catch (publicError) {
              console.error('Error fetching from public endpoint:', publicError);
              
              // Try local test endpoint as last resort
              try {
                console.log('Trying local test endpoint...');
                const testEndpoint = '/api/notices/test';
                
                console.log('Attempting to fetch from:', testEndpoint);
                
                // Test if the endpoint exists
                const testResponse = await fetch(testEndpoint, { 
                  method: 'HEAD' 
                });
                
                if (testResponse.ok) {
                  // Endpoint exists, try to fetch data
                  const dataResponse = await fetch(testEndpoint);
                  if (dataResponse.ok) {
                    const testData = await dataResponse.json();
                    console.log('Notices loaded from test endpoint:', testData?.length || 0);
                    setNotices(parseNoticesResponse(testData));
                    toast.warning('Using test notices - could not connect to backend');
                    return;
                  }
                }
                throw new Error('Test endpoint not available');
              } catch (testError) {
                console.error('Error using test endpoint:', testError);
              }
            }
          }
          
          // If both endpoints fail, use hardcoded test data as fallback
          console.log('Falling back to test notices');
          
          // Hardcoded test notices data for fallback
          const testData = [
            {
              _id: 'fallback-id-1',
              title: 'Fallback Placement Notice 1',
              description: 'This is a fallback placement notice',
              link: 'https://example.com/fallback1.pdf',
              content: 'Fallback placement notice content',
              company: 'Fallback Company A',
              type: 'placement',
              date: new Date().toISOString().split('T')[0]
            },
            {
              _id: 'fallback-id-2',
              title: 'Fallback Internship Notice 2',
              description: 'This is a fallback internship notice',
              link: 'https://example.com/fallback2.pdf',
              content: 'Fallback internship notice content',
              company: 'Fallback Company B',
              type: 'internship',
              date: new Date().toISOString().split('T')[0]
            }
          ];
          
          console.log('Test notices loaded as fallback:', testData.length);
          setNotices(parseNoticesResponse(testData));
          
          toast.warning('Using test notices due to backend error');
        }
      } catch (error) {
        console.error('Error fetching notices:', error);
        setNotices([]);
        toast.error(error instanceof Error ? error.message : 'Failed to load notices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const handleDownload = (notice: Notice) => {
    if (notice.link) {
      try {
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = notice.link;
        link.download = `${notice.title || 'notice'}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toast.error('Failed to download PDF');
      }
    }
  };

  const handleView = async (notice: Notice) => {
    if (notice.link) {
      try {
        // Set the viewing state
        setViewingPdf({
          url: notice.link,
          title: notice.title || 'Notice PDF'
        });
      } catch (error) {
        console.error('Error preparing PDF for viewing:', error);
        toast.error('Failed to view PDF');
      }
    }
  };
  
  // Function to close the PDF viewer
  const closePdfViewer = () => {
    setViewingPdf(null);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Notices
      </h1>

      <div className="grid gap-4">
        {notices.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No notices available at this time.</p>
          </div>
        )}
        
        {notices.map((notice) => (
          <Card key={notice._id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{notice.title}</p>
                  {notice.description && (
                    <p className="text-sm text-muted-foreground">{notice.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(notice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                    {notice.type && (
                      <Badge variant="outline" className="text-xs">
                        {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                      </Badge>
                    )}
                    {notice.company && (
                      <Badge variant="outline" className="text-xs">
                        {notice.company}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleView(notice)}
                  title="View PDF"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View {notice.title}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(notice)}
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download {notice.title}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">{viewingPdf.title}</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(viewingPdf.url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={closePdfViewer}>
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full h-full">
              <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingPdf.url)}&embedded=true`}
                className="w-full h-full"
                frameBorder="0"
                title={`${viewingPdf.title} (Google Docs Viewer)`}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}