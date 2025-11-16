"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, X } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState, useRef } from "react"

interface DocumentUploadStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  onNext: () => void
  onPrev: () => void
}

const requiredDocuments = [
  { key: "cinFront", label: "CIN Recto", required: true },
  { key: "cinBack", label: "CIN Verso", required: true },
  { key: "proofOfAddress", label: "Justificatif de domicile", required: true },
  { key: "proofOfIncome", label: "Justificatif de revenus", required: false },
]

export default function DocumentUploadStep({
  formData,
  updateFormData,
  errors,
  setErrors,
  onNext,
  onPrev,
}: DocumentUploadStepProps) {
  const [dragOver, setDragOver] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileUpload = (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setErrors({ ...errors, [key]: "Le fichier ne doit pas dépasser 5MB" })
      return
    }

    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      setErrors({ ...errors, [key]: "Format non supporté. Utilisez JPG, PNG ou PDF" })
      return
    }

    updateFormData({
      documents: {
        ...formData.documents,
        [key]: file,
      },
    })

    // Clear error for this field
    const newErrors = { ...errors }
    delete newErrors[key]
    setErrors(newErrors)
  }

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    setDragOver(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(key, files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    setDragOver(key)
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const removeFile = (key: string) => {
    const newDocuments = { ...formData.documents }
    delete newDocuments[key as keyof typeof newDocuments]
    updateFormData({ documents: newDocuments })
  }

  const validateDocuments = () => {
    const newErrors: Record<string, string> = {}

    requiredDocuments.forEach((doc) => {
      if (doc.required && !formData.documents[doc.key as keyof typeof formData.documents]) {
        newErrors[doc.key] = `${doc.label} est requis`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateDocuments()) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Téléchargement des documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-info/20 border-info text-info-foreground">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Téléchargez vos documents au format JPG, PNG ou PDF (max 5MB par fichier).
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredDocuments.map((doc) => {
            const file = formData.documents[doc.key as keyof typeof formData.documents]
            const hasError = errors[doc.key]
            const isDragOver = dragOver === doc.key

            return (
              <div key={doc.key} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {doc.label}
                  {doc.required && <span className="text-destructive">*</span>}
                </Label>

                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                      ? "border-primary/50 bg-primary/10"
                      : hasError
                        ? "border-destructive/50 bg-destructive/10"
                        : file
                          ? "border-success/50 bg-success/10"
                          : "border-border bg-card hover:border-muted-foreground"
                  }`}
                  onDrop={(e) => handleDrop(e, doc.key)}
                  onDragOver={(e) => handleDragOver(e, doc.key)}
                  onDragLeave={handleDragLeave}
                >
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-success mx-auto" />
                      <p className="text-sm font-medium text-success-foreground">{file.name}</p>
                      <p className="text-xs text-success">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button variant="outline" size="sm" onClick={() => removeFile(doc.key)} className="mt-2">
                        <X className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Glissez-déposez votre fichier ici ou</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[doc.key]?.click()}
                        className="bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80"
                      >
                        Parcourir
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  ref={(el) => (fileInputRefs.current[doc.key] = el)}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(doc.key, file)
                    }
                  }}
                />

                {hasError && <p className="text-destructive text-sm">{hasError}</p>}
              </div>
            )
          })}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Précédent
          </Button>
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
