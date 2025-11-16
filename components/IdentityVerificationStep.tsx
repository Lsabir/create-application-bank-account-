"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState } from "react"

interface IdentityVerificationStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  onNext: () => void
  onPrev: () => void
}

export default function IdentityVerificationStep({
  formData,
  updateFormData,
  errors,
  setErrors,
  onNext,
  onPrev,
}: IdentityVerificationStepProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending")

  const simulateVerification = async () => {
    setIsVerifying(true)
    setVerificationStatus("pending")

    // Simulation de la vérification
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulation d'une vérification réussie (90% de chance)
    const isSuccess = Math.random() > 0.1
    setVerificationStatus(isSuccess ? "success" : "error")
    setIsVerifying(false)

    if (isSuccess) {
      setTimeout(() => {
        onNext()
      }, 1500)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Le numéro de téléphone est requis"
    } else if (!/^\+?[0-9]{8,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Format de numéro invalide"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerify = () => {
    if (validateForm()) {
      simulateVerification()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérification d'identité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
              placeholder="+216 XX XXX XXX"
              className={`bg-card text-card-foreground ${errors.phoneNumber ? "border-destructive" : ""}`}
            />
            {errors.phoneNumber && <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <Label htmlFor="email">Adresse email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="votre.email@exemple.com"
              className={`bg-card text-card-foreground ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {verificationStatus === "pending" && !isVerifying && (
          <Alert className="bg-info/20 border-info text-info-foreground">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Cliquez sur "Vérifier" pour valider vos informations d'identité.</AlertDescription>
          </Alert>
        )}

        {isVerifying && (
          <Alert className="bg-info/20 border-info text-info-foreground">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Vérification en cours... Veuillez patienter.</AlertDescription>
          </Alert>
        )}

        {verificationStatus === "success" && (
          <Alert className="border-success/50 bg-success/10">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              Vérification réussie ! Redirection vers l'étape suivante...
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === "error" && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive-foreground">
              Échec de la vérification. Veuillez vérifier vos informations et réessayer.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} disabled={isVerifying}>
            Précédent
          </Button>

          {verificationStatus !== "success" && (
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isVerifying ? "Vérification..." : "Vérifier"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
