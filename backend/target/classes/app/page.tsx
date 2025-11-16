"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, FileText, Smartphone, Mail, CreditCard, Key } from "lucide-react"
import PersonalInfoStep from "@/components/PersonalInfoStep"
import AccountTypeStep from "@/components/AccountTypeStep"
import IdentityVerificationStep from "@/components/IdentityVerificationStep"
import DocumentUploadStep from "@/components/DocumentUploadStep"
import BiometricCaptureStep from "@/components/BiometricCaptureStep"
import OTPVerificationStep from "@/components/OTPVerificationStep"
import ContractSigningStep from "@/components/ContractSigningStep"
import AccountGenerationStep from "@/components/AccountGenerationStep"
import ConfirmationStep from "@/components/ConfirmationStep"
import Image from "next/image"

export interface FormData {
  // Informations personnelles
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string
  nationality: string
  cin: string

  // Type de compte
  accountType: string

  // Documents
  documents: {
    cinFront?: File
    cinBack?: File
    proofOfAddress?: File
    proofOfIncome?: File
  }

  // Données biométriques
  biometricData?: {
    photo?: string
    signature?: string
  }

  // Contact
  phoneNumber: string
  email: string

  // Validation
  otpCode: string
  contractSigned: boolean

  // Informations du compte
  accountInfo?: {
    accountNumber: string
    accessCode: string
    temporaryPassword: string
    iban: string
    activationCode: string
  }
  isAccountActivated?: boolean // Nouveau champ pour le statut d'activation
}

const steps = [
  { id: 1, title: "Informations personnelles", icon: FileText },
  { id: 2, title: "Type de compte", icon: CreditCard },
  { id: 3, title: "Vérification identité", icon: CheckCircle },
  { id: 4, title: "Documents", icon: FileText },
  { id: 5, title: "Capture biométrique", icon: CheckCircle },
  { id: 6, title: "Vérification OTP", icon: Smartphone },
  { id: 7, title: "Signature contrat", icon: FileText },
  { id: 8, title: "Génération compte", icon: Key },
  { id: 9, title: "Confirmation", icon: Mail },
]

export default function BankAccountCreation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    cin: "",
    accountType: "",
    documents: {},
    phoneNumber: "",
    email: "",
    otpCode: "",
    contractSigned: false,
    isAccountActivated: false, // Initialisé à false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <AccountTypeStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />
        )
      case 3:
        return (
          <IdentityVerificationStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <DocumentUploadStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 5:
        return (
          <BiometricCaptureStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 6:
        return (
          <OTPVerificationStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 7:
        return (
          <ContractSigningStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 8:
        return (
          <AccountGenerationStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 9:
        return <ConfirmationStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center py-8">
      {" "}
      {/* Centrage du contenu principal */}
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Image src="/images/logo.png" alt="Company Logo" width={80} height={80} />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Création de Compte Bancaire
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Suivez les étapes pour créer votre nouveau compte bancaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Progress value={progress} className="h-2 bg-primary" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Étape {currentStep} sur {steps.length}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {steps.map((step) => {
                const Icon = step.icon
                const isCompleted = currentStep > step.id
                const isCurrent = currentStep === step.id

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isCompleted
                        ? "bg-success/20 text-success-foreground"
                        : isCurrent
                          ? "bg-primary/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {renderStep()}
      </div>
    </div>
  )
}
