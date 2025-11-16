"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useActionState } from "react"
import { getUserSession, activateAccount } from "../actions"
import Image from "next/image"

export default function ActivateAccountPage() {
  const router = useRouter()
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activationCodeInput, setActivationCodeInput] = useState("")

  const [state, formAction, isPending] = useActionState(activateAccount, null)

  useEffect(() => {
    async function fetchSession() {
      const userSession = await getUserSession()
      if (!userSession || !userSession.loggedIn) {
        router.push("/client-space/login") // Non connecté
      } else if (userSession.isAccountActivated) {
        router.push("/client-space/dashboard") // Déjà activé
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
          <CardTitle className="text-2xl font-bold text-foreground">Activation du compte</CardTitle>
          <CardDescription className="text-muted-foreground">
            Veuillez saisir le code d'activation reçu pour finaliser l'ouverture de votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-info/20 border-info">
            <Shield className="h-4 w-4 text-info-foreground" />
            <AlertDescription className="text-info-foreground">
              Votre code d'activation est : <strong>{session.activationCode}</strong> (pour la démo)
            </AlertDescription>
          </Alert>

          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="activationCode">Code d'activation</Label>
              <Input
                id="activationCode"
                name="activationCode"
                type="text"
                value={activationCodeInput}
                onChange={(e) => setActivationCodeInput(e.target.value)}
                placeholder="Saisissez votre code à 8 caractères"
                maxLength={8}
                required
                className="font-mono text-center text-lg tracking-widest bg-card text-card-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Activation en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Activer mon compte
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
