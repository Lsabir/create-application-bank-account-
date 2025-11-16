"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormData } from "@/app/page"

interface PersonalInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  onNext: () => void
}

export default function PersonalInfoStep({
  formData,
  updateFormData,
  errors,
  setErrors,
  onNext,
}: PersonalInfoStepProps) {
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis"
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "La date de naissance est requise"
    }
    if (!formData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = "Le lieu de naissance est requis"
    }
    if (!formData.nationality) {
      newErrors.nationality = "La nationalité est requise"
    }
    if (!formData.cin.trim()) {
      newErrors.cin = "Le numéro CIN est requis"
    } else if (formData.cin.length !== 8) {
      newErrors.cin = "Le numéro CIN doit contenir 8 chiffres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations Personnelles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              className={`bg-card text-card-foreground ${errors.firstName ? "border-destructive" : ""}`}
            />
            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              className={`bg-card text-card-foreground ${errors.lastName ? "border-destructive" : ""}`}
            />
            {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date de naissance *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
              className={`bg-card text-card-foreground ${errors.dateOfBirth ? "border-destructive" : ""}`}
            />
            {errors.dateOfBirth && <p className="text-destructive text-sm mt-1">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <Label htmlFor="placeOfBirth">Lieu de naissance *</Label>
            <Input
              id="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={(e) => updateFormData({ placeOfBirth: e.target.value })}
              className={`bg-card text-card-foreground ${errors.placeOfBirth ? "border-destructive" : ""}`}
            />
            {errors.placeOfBirth && <p className="text-destructive text-sm mt-1">{errors.placeOfBirth}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationality">Nationalité *</Label>
            <Select value={formData.nationality} onValueChange={(value) => updateFormData({ nationality: value })}>
              <SelectTrigger
                className={`bg-card text-card-foreground ${errors.nationality ? "border-destructive" : ""}`}
              >
                <SelectValue placeholder="Sélectionnez votre nationalité" />
              </SelectTrigger>
              <SelectContent className="bg-card text-card-foreground">
                <SelectItem value="tunisienne">Tunisienne</SelectItem>
                <SelectItem value="francaise">Française</SelectItem>
                <SelectItem value="algerienne">Algérienne</SelectItem>
                <SelectItem value="marocaine">Marocaine</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.nationality && <p className="text-destructive text-sm mt-1">{errors.nationality}</p>}
          </div>

          <div>
            <Label htmlFor="cin">Numéro CIN *</Label>
            <Input
              id="cin"
              value={formData.cin}
              onChange={(e) => updateFormData({ cin: e.target.value })}
              placeholder="12345678"
              maxLength={8}
              className={`bg-card text-card-foreground ${errors.cin ? "border-destructive" : ""}`}
            />
            {errors.cin && <p className="text-destructive text-sm mt-1">{errors.cin}</p>}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
