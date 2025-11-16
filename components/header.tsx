"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { getUserSession, logout } from "@/app/client-space/actions"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function Header() {
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchSession() {
      const userSession = await getUserSession()
      setSession(userSession)
      setLoading(false)
    }
    fetchSession()
  }, [])

  const handleLogout = async () => {
    await logout()
    setSession(null) // Clear session state
    router.push("/client-space/login")
  }

  return (
    <header className="bg-card text-card-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Company Logo" width={40} height={40} />
          <span className="text-xl font-bold hidden sm:block">Banque Digitale</span>
        </Link>
        <nav>
          {loading ? (
            <div className="h-8 w-24 animate-pulse bg-muted rounded-md" />
          ) : session?.loggedIn ? (
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-sm">
                Bienvenue, <span className="font-semibold">{session.firstName}</span>
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </Button>
            </div>
          ) : (
            <Button asChild variant="secondary">
              <Link href="/client-space/login">Se connecter</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
