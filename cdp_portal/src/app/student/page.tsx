"use client"

import { Separator } from "@/components/ui/separator"
import { NotificationList } from "@/components/notification_list"
import { CommentSection } from "@/components/comment_section"
import { useApi } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { useEffect, useState, useRef } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Cycle {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  status: string
}

export default function NotificationPage() {
  const router = useRouter()
  const { fetchWithAuth } = useApi()
  const { token, user } = useAuth()
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [notifLoading, setNotifLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(false)
  const hasFetched = useRef(false)

  // Initial fetch on mount
  useEffect(() => {
    mounted.current = true
    hasFetched.current = false

    const fetchData = async () => {
      if (!token || !user || !mounted.current || hasFetched.current) return
      
      setLoading(true)
      try {
        // Get student's active cycle
        const cycleResponse = await fetchWithAuth('/api/placement-cycles/student', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (!cycleResponse.ok) {
          const errorText = await cycleResponse.text()
          console.error('Cycle fetch error:', {
            status: cycleResponse.status,
            statusText: cycleResponse.statusText,
            error: errorText
          })
          if (cycleResponse.status === 401) {
            router.push('/login')
            return
          }
          throw new Error(`HTTP error! status: ${cycleResponse.status} - ${errorText}`)
        }
        
        const cycleData = await cycleResponse.json()
        console.log('Cycle data:', cycleData)
        
        if (!mounted.current) return

        if (!cycleData) {
          setError("No active placement cycle found")
          setLoading(false)
          return
        }
        
        setCycle(cycleData)
        hasFetched.current = true

        // Fetch notifications for the active cycle
        const notifResponse = await fetchWithAuth(`/api/notifications/${cycleData.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        if (!notifResponse.ok) {
          const errorText = await notifResponse.text()
          console.error('Notifications fetch error:', {
            status: notifResponse.status,
            statusText: notifResponse.statusText,
            error: errorText
          })
          if (notifResponse.status === 401) {
            router.push('/login')
            return
          }
          throw new Error(`HTTP error! status: ${notifResponse.status} - ${errorText}`)
        }

        const notifData = await notifResponse.json()
        console.log('Notifications data:', notifData)
        
        if (mounted.current) {
          setNotifications(notifData || [])
        }
      } catch (err) {
        if (!mounted.current) return
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        if (mounted.current) {
          setLoading(false)
          setNotifLoading(false)
        }
      }
    }

    if (!token || !user) {
      setLoading(false)
      setError("Please log in to view notifications")
      return
    }

    fetchData()

    return () => {
      mounted.current = false
    }
  }, []) // Empty dependency array - only run on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !cycle) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground text-center mb-4">{error || 'Cycle not found.'}</p>
            {error === "Please log in to view notifications" && (
              <button 
                onClick={() => router.push('/login')}
                className="text-template hover:underline"
              >
                Go to Login
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Cycle Header */}
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{cycle.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {cycle.type} • {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Notifications and Comments Section */}
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-template mb-4">Latest Notifications</h2>
                <Separator className="mb-6" />
                <NotificationList notifications={notifications} loading={notifLoading} />
              </div>
            </div>
            <div>
              <CommentSection placementCycleId={cycle.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

