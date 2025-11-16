"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Shield, Loader2, XCircle } from "lucide-react"
import { useActionState } from "react"
import { getUserSession, changeUserPassword } from "../actions"
import Image from "next/image"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [state, formAction, isPending] = useActionState(changeUserPassword, null)

  useEffect(() => {
    async function fetchSession() {
      const userSession = await getUserSession()
      if (!userSession || !userSession.loggedIn || userSession.isTemporaryPasswordUsed) {
        // Si pas connecté, ou déjà changé le mot de passe, rediriger vers le tableau de bord
        router.push("/client-space/dashboard")
      } else {
        setSession(userSession)
        setLoading(false)
      }
    }
    fetchSession()
  }, [router])

  useEffect(() => {
    if (state?.success) {
      alert(state.message)
      router.push("/client-space/dashboard") // Rediriger vers le tableau de bord après succès
    } else if (state && !state.success) {
      alert(state.message)
    }
  }, [state, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        {" "}
        {/* Utilise flex-1 pour prendre l'espace */}
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!session) {
    return null // Redirection gérée par useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      {" "}
      {/* Centrage du contenu */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/logo.png" alt="Company Logo" width={80} height={80} />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Changer votre mot de passe</CardTitle>
          <CardDescription className="text-muted-foreground">
            Pour votre sécurité, veuillez définir un nouveau mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-warning/10 border-warning/50">
            <Shield className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              Vous utilisez un mot de passe temporaire. Veuillez le changer pour accéder à votre espace client.
            </AlertDescription>
          </Alert>

          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-card text-card-foreground"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-card text-card-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changement en cours...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" /> Changer le mot de passe
                </>
              )}
            </Button>
          </form>

          {state && !state.success && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive-foreground">{state.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
