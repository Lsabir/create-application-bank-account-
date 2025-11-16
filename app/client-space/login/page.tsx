"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Shield, Loader2, Eye, EyeOff } from "lucide-react"
import { useActionState } from "react"
import { clientLogin } from "../actions"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(clientLogin, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showAccessCode, setShowAccessCode] = useState(false)

  useEffect(() => {
    if (state?.success) {
      alert(state.message)
      // Redirection conditionnelle
      if (state.isTemporaryPasswordUsed === false) {
        router.push("/client-space/change-password") // Rediriger vers la page de changement de mot de passe
      } else {
        router.push("/client-space/dashboard") // Rediriger vers le tableau de bord
      }
    } else if (state && !state.success) {
      alert(state.message)
    }
  }, [state, router])

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      {" "}
      {/* Centrage du contenu */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/logo.png" alt="Company Logo" width={80} height={80} />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Espace Client</CardTitle>
          <CardDescription className="text-muted-foreground">Connectez-vous à votre compte bancaire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="accountNumber">Numéro de compte</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="Ex: 1000200112345678"
                required
                className="font-mono bg-card text-card-foreground"
              />
            </div>

            <div>
              <Label htmlFor="accessCode">Code d'accès</Label>
              <div className="relative">
                <Input
                  id="accessCode"
                  name="accessCode"
                  type={showAccessCode ? "text" : "password"}
                  placeholder="••••••"
                  maxLength={6}
                  required
                  className="font-mono pr-10 bg-card text-card-foreground"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowAccessCode(!showAccessCode)}
                >
                  {showAccessCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="temporaryPassword">Mot de passe</Label> {/* Renommé pour être plus générique */}
              <div className="relative">
                <Input
                  id="temporaryPassword"
                  name="temporaryPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  maxLength={8}
                  required
                  className="font-mono pr-10 bg-card text-card-foreground"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" /> Se connecter
                </>
              )}
            </Button>
          </form>

          {state && !state.success && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <Shield className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive-foreground">{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>
              Pas encore de compte ?{" "}
              <Button variant="link" onClick={() => router.push("/")} className="text-primary p-0 h-auto">
                Créer un compte
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
