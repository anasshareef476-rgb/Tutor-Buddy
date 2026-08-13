'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getToken } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/login')
    } else {
      setAuthorized(true)
    }
  }, [pathname, router])

  if (!authorized) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#000' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return <>{children}</>
}
