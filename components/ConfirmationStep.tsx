"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, CreditCard, Calendar, User, Key, Shield, ExternalLink } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ConfirmationStepProps {
  formData: FormData
}

export default function ConfirmationStep({ formData }: ConfirmationStepProps) {
  const router = useRouter()
  const [showAccessPortal, setShowAccessPortal] = useState(false)

  // Store account data in localStorage for persistence across pages
  useEffect(() => {
    if (formData.accountInfo) {
      const accountDataToStore = {
        accountNumber: formData.accountInfo.accountNumber,
        accessCode: formData.accountInfo.accessCode,
        temporaryPassword: formData.accountInfo.temporaryPassword,
        activationCode: formData.accountInfo.activationCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        accountType: formData.accountType,
        isTemporaryPasswordUsed: false, // Initialement, le mot de passe temporaire n'a pas été changé
        currentPassword: formData.accountInfo.temporaryPassword, // Le mot de passe actuel est le temporaire
        isAccountActivated: false, // Initialement, le compte n'est pas activé
      }
      localStorage.setItem("bankAccountData", JSON.stringify(accountDataToStore))
    }
  }, [formData])

  const handleDownloadSummary = () => {
    const summary = `
RÉCAPITULATIF DE CRÉATION DE COMPTE BANCAIRE

Informations personnelles:
- Nom: ${formData.firstName} ${formData.lastName}
- Date de naissance: ${formData.dateOfBirth}
- Lieu de naissance: ${formData.placeOfBirth}
- Nationalité: ${formData.nationality}
- CIN: ${formData.cin}

Informations du compte:
- Type de compte: ${formData.accountType}
- Numéro de compte: ${formData.accountInfo?.accountNumber}
- IBAN: ${formData.accountInfo?.iban}
- Code d'accès: ${formData.accountInfo?.accessCode}
- Mot de passe temporaire: ${formData.accountInfo?.temporaryPassword}
- Code d'activation: ${formData.accountInfo?.activationCode}

Contact:
- Email: ${formData.email}
- Téléphone: ${formData.phoneNumber}

Date de création: ${new Date().toLocaleDateString("fr-FR")}
Statut: Compte créé - En attente d'activation

IMPORTANT:
- Votre compte est créé mais pas encore activé
- Utilisez vos identifiants pour accéder à l'espace client
- Activez votre compte avec le code d'activation
- Changez votre mot de passe lors de la première connexion

Prochaines étapes:
1. Accédez à votre espace client avec vos identifiants
2. Activez votre compte avec le code d'activation
3. Personnalisez vos paramètres de sécurité
4. Votre carte bancaire sera expédiée sous 5-7 jours

Merci de votre confiance !
    `

    const element = document.createElement("a")
    const file = new Blob([summary], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "recapitulatif-compte-bancaire.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleAccessAccount = () => {
    router.push("/client-space/login")
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <CardTitle className="text-2xl text-success-foreground">Compte créé avec succès !</CardTitle>
        <p className="text-muted-foreground">Votre compte bancaire a été généré et est prêt à être activé</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success-foreground">
            <strong>✅ Compte créé avec succès !</strong>
            <br />
            Votre compte est généré avec tous vos identifiants. Vous pouvez maintenant y accéder pour l'activer
            définitivement.
          </AlertDescription>
        </Alert>

        <div className="bg-info/20 border border-info rounded-lg p-6">
          <h3 className="font-semibold text-info-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Informations de votre compte
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-info-foreground" />
              <span className="font-medium">Titulaire:</span>
              <span>
                {formData.firstName} {formData.lastName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-info-foreground" />
              <span className="font-medium">Type:</span>
              <span className="capitalize">{formData.accountType}</span>
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <span className="font-medium">Numéro de compte:</span>
              <span className="font-mono bg-background px-2 py-1 rounded border border-border">
                {formData.accountInfo?.accountNumber}
              </span>
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <span className="font-medium">IBAN:</span>
              <span className="font-mono bg-background px-2 py-1 rounded border border-border text-xs">
                {formData.accountInfo?.iban}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-info-foreground" />
              <span className="font-medium">Date de création:</span>
              <span>{new Date().toLocaleDateString("fr-FR")}</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-info-foreground" />
              <span className="font-medium">Email:</span>
              <span>{formData.email}</span>
            </div>
          </div>
        </div>

        {/* Statut du compte */}
        <div className="bg-warning/10 border border-warning/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-warning" />
            <h4 className="font-semibold text-warning-foreground">Statut du compte</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
            <span className="text-warning-foreground font-medium">Créé - En attente d'activation</span>
          </div>
          <p className="text-warning-foreground text-sm mt-2">
            Votre compte est créé mais nécessite une activation avec votre code d'activation pour être pleinement
            opérationnel.
          </p>
        </div>

        {/* Accès au compte */}
        <div className="bg-primary/10 border border-primary/50 rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Key className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-xl text-primary-foreground">Accès à votre compte</h4>
            </div>
            <p className="text-primary">
              Vous pouvez dès maintenant accéder à votre espace client pour activer votre compte et personnaliser vos
              paramètres.
            </p>
            <Button
              onClick={handleAccessAccount}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              ACCÉDER À MON COMPTE
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Prochaines étapes</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Accès à votre espace client</p>
                <p className="text-sm text-muted-foreground">
                  Connectez-vous avec vos identifiants pour accéder à votre compte
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Activation du compte</p>
                <p className="text-sm text-muted-foreground">
                  Utilisez votre code d'activation pour activer définitivement votre compte
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Personnalisation et sécurité</p>
                <p className="text-sm text-muted-foreground">
                  Changez votre mot de passe et configurez vos préférences de sécurité
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-6 h-6 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Réception de votre carte bancaire</p>
                <p className="text-sm text-muted-foreground">
                  Votre carte sera expédiée à votre adresse sous 5-7 jours ouvrables
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={handleDownloadSummary}
            variant="outline"
            className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            Télécharger le récapitulatif
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Retour à l'accueil
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
          <p>
            Pour toute question, contactez notre service client au <span className="font-medium">+216 71 123 456</span>{" "}
            ou par email à <span className="font-medium">support@banque.tn</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
