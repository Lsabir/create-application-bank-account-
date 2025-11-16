"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCard, PiggyBank, TrendingUp, Building } from "lucide-react"
import type { FormData } from "@/app/page"

interface AccountTypeStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
}

const accountTypes = [
  {
    id: "courant",
    title: "Compte Courant",
    description: "Pour vos opérations quotidiennes",
    icon: CreditCard,
    features: ["Carte bancaire incluse", "Virements illimités", "Découvert autorisé"],
  },
  {
    id: "epargne",
    title: "Compte Épargne",
    description: "Pour faire fructifier votre argent",
    icon: PiggyBank,
    features: ["Taux d'intérêt attractif", "Capital garanti", "Disponibilité immédiate"],
  },
  {
    id: "investissement",
    title: "Compte Investissement",
    description: "Pour vos placements financiers",
    icon: TrendingUp,
    features: ["Accès aux marchés", "Conseiller dédié", "Outils d'analyse"],
  },
  {
    id: "professionnel",
    title: "Compte Professionnel",
    description: "Pour votre activité professionnelle",
    icon: Building,
    features: ["Gestion multi-utilisateurs", "Outils comptables", "Financement entreprise"],
  },
]

export default function AccountTypeStep({ formData, updateFormData, onNext, onPrev }: AccountTypeStepProps) {
  const handleNext = () => {
    if (formData.accountType) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choisissez votre type de compte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={formData.accountType}
          onValueChange={(value) => updateFormData({ accountType: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {accountTypes.map((account) => {
            const Icon = account.icon
            return (
              <div key={account.id} className="relative">
                <RadioGroupItem value={account.id} id={account.id} className="peer sr-only" />
                <Label
                  htmlFor={account.id}
                  className="flex flex-col p-6 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold text-lg">{account.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{account.description}</p>
                  <ul className="space-y-2">
                    {account.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Label>
              </div>
            )
          })}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={!formData.accountType}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
