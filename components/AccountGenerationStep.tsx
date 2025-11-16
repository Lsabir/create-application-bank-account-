"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Shield, CreditCard, Eye, EyeOff, Copy, CheckCircle, Loader2 } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState } from "react"

interface AccountGenerationStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function AccountGenerationStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: AccountGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Générer les informations du compte
  const generateAccountInfo = () => {
    // Numéro de compte (format tunisien)
    const bankCode = "1000"
    const branchCode = "2001"
    const accountSequence = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0")
    const accountNumber = `${bankCode}${branchCode}${accountSequence}`

    // IBAN tunisien
    const ibanSuffix = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0")
    const iban = `TN59 ${bankCode} ${branchCode} ${accountSequence} ${ibanSuffix}`

    // Code d'accès (6 chiffres)
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Mot de passe temporaire
    const tempPassword = generateTempPassword()

    // Code d'activation (8 caractères)
    const activationCode = generateActivationCode()

    return {
      accountNumber,
      iban,
      accessCode,
      temporaryPassword: tempPassword,
      activationCode,
    }
  }

  const generateTempPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generateActivationCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const startGeneration = async () => {
    setIsGenerating(true)

    try {
      // Appeler l'API pour créer le compte dans la base de données
      const response = await fetch('http://localhost:8080/api/accounts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          placeOfBirth: formData.placeOfBirth,
          nationality: formData.nationality,
          cin: formData.cin,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          accountType: formData.accountType,
          biometricData: formData.biometricData
        })
      })

      const result = await response.json()

      if (result.success) {
        // Utiliser les données retournées par le backend
        const accountInfo = {
          accountNumber: result.accountInfo.accountNumber,
          iban: result.accountInfo.iban,
          accessCode: result.accountInfo.accessCode,
          temporaryPassword: result.accountInfo.temporaryPassword,
          activationCode: result.accountInfo.activationCode
        }

        updateFormData({ accountInfo })
        setGenerationComplete(true)
        console.log('✅ Compte créé avec succès dans MySQL:', result)
      } else {
        console.error('❌ Erreur création compte:', result.message)
        alert('Erreur lors de la création du compte: ' + result.message)
      }
    } catch (error) {
      console.error('❌ Erreur API:', error)
      alert('Erreur de connexion au serveur')
    }

    setIsGenerating(false)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Erreur copie:", error)
    }
  }

  const handleNext = () => {
    if (generationComplete) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-6 h-6 text-foreground" />
          Génération du compte bancaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isGenerating && !generationComplete && (
          <>
            <Alert className="bg-info/20 border-info">
              <Shield className="h-4 w-4 text-info-foreground" />
              <AlertDescription className="text-info-foreground">
                <strong>Génération sécurisée de votre compte :</strong>
                <br />• Numéro de compte unique
                <br />• Code d'accès personnel
                <br />• Mot de passe temporaire
                <br />• Code d'activation
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Key className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground mb-2">Prêt à générer votre compte</h3>
                <p className="text-muted-foreground">
                  Cliquez sur le bouton ci-dessous pour générer vos informations de compte sécurisées
                </p>
              </div>
              <Button
                onClick={startGeneration}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
              >
                <Key className="w-5 h-5 mr-2" />
                GÉNÉRER MON COMPTE
              </Button>
            </div>
          </>
        )}

        {isGenerating && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h3 className="font-bold text-xl text-primary-foreground mb-2">Génération en cours...</h3>
            <p className="text-primary">Création de vos identifiants sécurisés</p>
            <div className="bg-info/20 border border-info rounded-lg p-4">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-info-foreground">Processus de sécurisation en cours...</span>
              </div>
            </div>
          </div>
        )}

        {generationComplete && formData.accountInfo && (
          <div className="space-y-6">
            <Alert className="bg-success/10 border-success/50">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success-foreground">
                <strong>✅ Compte généré avec succès !</strong>
                <br />
                Conservez précieusement ces informations. Elles vous seront nécessaires pour accéder à votre compte.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Numéro de compte */}
              <div className="bg-card border-2 border-primary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-primary-foreground">Numéro de compte</h4>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 font-mono text-lg text-center text-foreground">
                  {formData.accountInfo.accountNumber}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent text-foreground hover:bg-muted/20"
                  onClick={() => copyToClipboard(formData.accountInfo!.accountNumber, "account")}
                >
                  {copiedField === "account" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" /> Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" /> Copier
                    </>
                  )}
                </Button>
              </div>

              {/* IBAN */}
              <div className="bg-card border-2 border-success/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-success" />
                  <h4 className="font-semibold text-success-foreground">IBAN</h4>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 font-mono text-sm text-center text-foreground">
                  {formData.accountInfo.iban}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent text-foreground hover:bg-muted/20"
                  onClick={() => copyToClipboard(formData.accountInfo!.iban, "iban")}
                >
                  {copiedField === "iban" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" /> Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" /> Copier
                    </>
                  )}
                </Button>
              </div>

              {/* Code d'accès */}
              <div className="bg-card border-2 border-warning/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold text-warning-foreground">Code d'accès</h4>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 font-mono text-lg text-center relative text-foreground">
                  {showAccessCode ? formData.accountInfo.accessCode : "••••••"}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                  >
                    {showAccessCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent text-foreground hover:bg-muted/20"
                  onClick={() => copyToClipboard(formData.accountInfo!.accessCode, "access")}
                >
                  {copiedField === "access" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" /> Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" /> Copier
                    </>
                  )}
                </Button>
              </div>

              {/* Mot de passe temporaire */}
              <div className="bg-card border-2 border-destructive/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-destructive" />
                  <h4 className="font-semibold text-destructive-foreground">Mot de passe temporaire</h4>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 font-mono text-lg text-center relative text-foreground">
                  {showPassword ? formData.accountInfo.temporaryPassword : "••••••••"}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent text-foreground hover:bg-muted/20"
                  onClick={() => copyToClipboard(formData.accountInfo!.temporaryPassword, "password")}
                >
                  {copiedField === "password" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" /> Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" /> Copier
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Code d'activation */}
            <div className="bg-accent/10 border-2 border-accent/50 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-accent-foreground" />
                <h4 className="font-bold text-xl text-accent-foreground">Code d'activation</h4>
              </div>
              <div className="bg-background rounded-lg p-4 border-2 border-accent/20">
                <div className="font-mono text-2xl font-bold text-foreground tracking-wider">
                  {formData.accountInfo.activationCode}
                </div>
              </div>
              <p className="text-accent-foreground text-sm">
                <strong>Important :</strong> Ce code sera nécessaire pour activer définitivement votre compte
              </p>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(formData.accountInfo!.activationCode, "activation")}
                className="border-accent/50 text-accent-foreground hover:bg-accent/10"
              >
                {copiedField === "activation" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" /> Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copier le code
                  </>
                )}
              </Button>
            </div>

            <Alert className="bg-warning/10 border-warning/50">
              <Shield className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                <strong>⚠️ Sécurité importante :</strong>
                <br />• Conservez ces informations en lieu sûr
                <br />• Ne partagez jamais vos codes d'accès
                <br />• Changez votre mot de passe lors de la première connexion
                <br />• Le code d'activation est à usage unique
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} disabled={isGenerating}>
            ← Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={!generationComplete}
            className={`font-bold ${generationComplete ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {generationComplete ? "✅ CONTINUER →" : "⏳ Génération en cours..."}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
