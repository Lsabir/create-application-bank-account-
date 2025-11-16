"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Mail, CheckCircle, AlertCircle } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState, useEffect } from "react"
import { sendOTP } from "@/app/client-space/actions"

interface OTPVerificationStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  onNext: () => void
  onPrev: () => void
}

export default function OTPVerificationStep({
  formData,
  updateFormData,
  errors,
  setErrors,
  onNext,
  onPrev,
}: OTPVerificationStepProps) {
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending")
  const [generatedOTP, setGeneratedOTP] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendOTPCode = async () => {
    setIsLoading(true)
    try {
      // Solution temporaire : générer un code OTP fixe pour les tests
      const testOTP = "123456"
      setGeneratedOTP(testOTP)
      setOtpSent(true)
      setCountdown(60)
      console.log("Code OTP de test:", testOTP)
      
      // Essayer aussi l'API réelle en arrière-plan
      try {
        const result = await sendOTP(formData.phoneNumber)
        if (result.success && result.otpCode) {
          setGeneratedOTP(result.otpCode)
          console.log("Code OTP du serveur:", result.otpCode)
        }
      } catch (apiError) {
        console.log("API backend non disponible, utilisation du code de test")
      }
    } catch (error) {
      setErrors({ otp: "Erreur lors de l'envoi du code OTP" })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (formData.otpCode === generatedOTP) {
      setVerificationStatus("success")
      setTimeout(() => {
        onNext()
      }, 1500)
    } else {
      setVerificationStatus("error")
      setErrors({ otpCode: "Code OTP incorrect" })
    }
  }

  const resendOTP = () => {
    if (countdown === 0) {
      sendOTPCode()
      setVerificationStatus("pending")
      updateFormData({ otpCode: "" })
      setErrors({})
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérification par SMS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-info/20 border-info text-info-foreground">
          <Smartphone className="h-4 w-4" />
          <AlertDescription>Un code de vérification sera envoyé au numéro {formData.phoneNumber}</AlertDescription>
        </Alert>

        {!otpSent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Cliquez sur le bouton ci-dessous pour recevoir votre code de vérification
            </p>
            <Button
              onClick={sendOTPCode}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le code SMS"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <p className="text-success-foreground font-medium">Code envoyé avec succès !</p>
              <p className="text-sm text-muted-foreground mt-2">Vérifiez vos SMS et saisissez le code à 6 chiffres</p>

              {/* Affichage du code pour les tests */}
              {generatedOTP && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/50 rounded-lg">
                  <p className="text-sm text-warning-foreground">
                    <strong>Code de test:</strong> {generatedOTP}
                  </p>
                  <p className="text-xs text-warning mt-1">(Ce code est affiché uniquement pour les tests)</p>
                </div>
              )}
            </div>

            <div className="max-w-xs mx-auto">
              <Label htmlFor="otpCode">Code de vérification</Label>
              <Input
                id="otpCode"
                value={formData.otpCode}
                onChange={(e) => {
                  updateFormData({ otpCode: e.target.value })
                  setErrors({})
                  setVerificationStatus("pending")
                }}
                placeholder="123456"
                maxLength={6}
                className={`bg-card text-card-foreground text-center text-lg tracking-widest ${errors.otpCode ? "border-destructive" : ""}`}
              />
              {errors.otpCode && <p className="text-destructive text-sm mt-1 text-center">{errors.otpCode}</p>}
            </div>

            {verificationStatus === "success" && (
              <Alert className="border-success/50 bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success-foreground">
                  Code vérifié avec succès ! Redirection vers l'étape suivante...
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === "error" && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive-foreground">
                  Code incorrect. Veuillez vérifier et réessayer.
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-2">
              <Button
                onClick={verifyOTP}
                disabled={formData.otpCode.length !== 6 || verificationStatus === "success"}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Vérifier le code
              </Button>

              <div className="text-sm text-muted-foreground">
                {countdown > 0 ? (
                  <p>Renvoyer le code dans {countdown}s</p>
                ) : (
                  <Button variant="link" onClick={resendOTP} className="text-primary">
                    Renvoyer le code
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Précédent
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
