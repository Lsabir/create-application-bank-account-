"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState } from "react"
import { Label } from "@/components/ui/label"

interface ContractSigningStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
}

const contractText = `
CONTRAT D'OUVERTURE DE COMPTE BANCAIRE

Article 1 - Objet du contrat
Le présent contrat a pour objet l'ouverture et la gestion d'un compte bancaire au nom de ${""} auprès de notre établissement bancaire.

Article 2 - Conditions d'ouverture
Le compte est ouvert sous réserve de la vérification des pièces justificatives fournies et de l'acceptation du dossier par la banque.

Article 3 - Fonctionnement du compte
Le titulaire du compte s'engage à :
- Alimenter régulièrement son compte
- Respecter les conditions tarifaires en vigueur
- Signaler tout changement de situation
- Utiliser les services bancaires de manière responsable

Article 4 - Services inclus
Le compte comprend :
- Une carte bancaire
- L'accès aux services en ligne
- Les virements et prélèvements
- Un découvert autorisé selon conditions

Article 5 - Tarification
Les tarifs applicables sont ceux en vigueur au moment de l'ouverture du compte, consultables en agence et sur notre site internet.

Article 6 - Protection des données
Vos données personnelles sont traitées conformément au RGPD et à notre politique de confidentialité.

Article 7 - Résiliation
Le compte peut être fermé à tout moment par le titulaire ou par la banque selon les conditions légales.

Article 8 - Droit applicable
Le présent contrat est soumis au droit tunisien. Tout litige sera soumis aux tribunaux compétents.

En signant ce contrat, vous acceptez l'ensemble des conditions générales de vente et d'utilisation de nos services bancaires.
`

export default function ContractSigningStep({ formData, updateFormData, onNext, onPrev }: ContractSigningStepProps) {
  const [hasReadContract, setHasReadContract] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptDataProcessing, setAcceptDataProcessing] = useState(false)

  // Fonction pour générer et télécharger le PDF
  const downloadContractPDF = async () => {
    try {
      // Importer jsPDF dynamiquement
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF()

      // Configuration
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      const lineHeight = 7
      let yPosition = margin

      // Titre
      doc.setFontSize(16)
      doc.setFont(undefined, "bold")
      doc.text("CONTRAT D'OUVERTURE DE COMPTE BANCAIRE", pageWidth / 2, yPosition, { align: "center" })
      yPosition += lineHeight * 2

      // Informations du client
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("INFORMATIONS DU TITULAIRE:", margin, yPosition)
      yPosition += lineHeight

      doc.setFont(undefined, "normal")
      doc.text(`Nom: ${formData.firstName} ${formData.lastName}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`Date de naissance: ${formData.dateOfBirth}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`Lieu de naissance: ${formData.placeOfBirth}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`Nationalité: ${formData.nationality}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`CIN: ${formData.cin}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`Type de compte: ${formData.accountType}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`Email: ${formData.email}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`Téléphone: ${formData.phoneNumber}`, margin, yPosition)
      yPosition += lineHeight * 2

      // Contrat
      doc.setFont(undefined, "bold")
      doc.text("TERMES ET CONDITIONS:", margin, yPosition)
      yPosition += lineHeight

      doc.setFont(undefined, "normal")
      doc.setFontSize(10)

      // Diviser le texte du contrat en lignes
      const contractLines = doc.splitTextToSize(
        contractText.replace('${""}', `${formData.firstName} ${formData.lastName}`),
        pageWidth - 2 * margin,
      )

      contractLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 5
      })

      // Nouvelle page pour les signatures
      doc.addPage()
      yPosition = margin

      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("SIGNATURES ET DOCUMENTS", pageWidth / 2, yPosition, { align: "center" })
      yPosition += lineHeight * 2

      // Photo d'identité
      if (formData.biometricData?.photo) {
        doc.text("PHOTO D'IDENTITÉ:", margin, yPosition)
        yPosition += lineHeight

        try {
          doc.addImage(formData.biometricData.photo, "JPEG", margin, yPosition, 60, 45)
          yPosition += 50
        } catch (error) {
          console.error("Erreur ajout photo:", error)
          doc.text("Photo non disponible", margin, yPosition)
          yPosition += lineHeight
        }
      }

      // Signature
      if (formData.biometricData?.signature) {
        doc.text("SIGNATURE ÉLECTRONIQUE:", margin, yPosition)
        yPosition += lineHeight

        try {
          doc.addImage(formData.biometricData.signature, "PNG", margin, yPosition, 80, 30)
          yPosition += 35
        } catch (error) {
          console.error("Erreur ajout signature:", error)
          doc.text("Signature non disponible", margin, yPosition)
          yPosition += lineHeight
        }
      }

      // Date et lieu
      yPosition += lineHeight
      doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, margin, yPosition)
      yPosition += lineHeight
      doc.text(`Lieu: Tunis, Tunisie`, margin, yPosition)

      // Télécharger le PDF
      doc.save(`contrat-compte-bancaire-${formData.firstName}-${formData.lastName}.pdf`)
    } catch (error) {
      console.error("Erreur génération PDF:", error)
      alert("Erreur lors de la génération du PDF. Téléchargement du fichier texte...")
      downloadContractText()
    }
  }

  // Fallback: téléchargement texte
  const downloadContractText = () => {
    const contractContent = `
CONTRAT D'OUVERTURE DE COMPTE BANCAIRE

INFORMATIONS DU TITULAIRE:
Nom: ${formData.firstName} ${formData.lastName}
Date de naissance: ${formData.dateOfBirth}
Lieu de naissance: ${formData.placeOfBirth}
Nationalité: ${formData.nationality}
CIN: ${formData.cin}
Type de compte: ${formData.accountType}
Email: ${formData.email}
Téléphone: ${formData.phoneNumber}

${contractText.replace('${""}', `${formData.firstName} ${formData.lastName}`)}

Date: ${new Date().toLocaleDateString("fr-FR")}
Lieu: Tunis, Tunisie

Photo et signature électronique incluses dans le dossier numérique.
    `

    const element = document.createElement("a")
    const file = new Blob([contractContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `contrat-compte-bancaire-${formData.firstName}-${formData.lastName}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSign = () => {
    updateFormData({ contractSigned: true })
    onNext()
  }

  const canSign = hasReadContract && acceptTerms && acceptDataProcessing

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature du contrat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-info/20 border-info text-info-foreground">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Veuillez lire attentivement le contrat d'ouverture de compte avant de le signer.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Contrat d'ouverture de compte</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadContractPDF}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>

          <ScrollArea className="h-64 w-full border rounded-lg p-4 bg-background">
            <div className="text-sm whitespace-pre-line">
              {contractText.replace('${""}', `${formData.firstName} ${formData.lastName}`)}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="readContract"
              checked={hasReadContract}
              onCheckedChange={(checked) => setHasReadContract(checked as boolean)}
            />
            <Label htmlFor="readContract" className="text-sm">
              J'ai lu et compris l'intégralité du contrat d'ouverture de compte
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <Label htmlFor="acceptTerms" className="text-sm">
              J'accepte les conditions générales de vente et d'utilisation
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptDataProcessing"
              checked={acceptDataProcessing}
              onCheckedChange={(checked) => setAcceptDataProcessing(checked as boolean)}
            />
            <Label htmlFor="acceptDataProcessing" className="text-sm">
              J'accepte le traitement de mes données personnelles conformément au RGPD
            </Label>
          </div>
        </div>

        {canSign && (
          <Alert className="border-success/50 bg-success/10">
            <FileText className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              Vous pouvez maintenant signer électroniquement votre contrat. Le PDF inclura votre photo et signature.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Précédent
          </Button>
          <Button
            onClick={handleSign}
            disabled={!canSign}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Signer électroniquement
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
