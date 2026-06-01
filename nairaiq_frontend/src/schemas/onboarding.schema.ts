import { z } from 'zod'

export const onboardingSchema = z.object({
  fullName: z.string().min(2),
  age_range: z.enum(['18-24','25-34','35-44','45-54','55+']),
  state: z.string(),
  occupation: z.string(),
  income_range: z.string(),
  pays_rent: z.boolean(),
  has_dependants: z.boolean(),
  primary_bank: z.string()
})

export type OnboardingForm = z.infer<typeof onboardingSchema>
