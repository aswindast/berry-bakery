export type CustomCakeFormValues = {
  name: string
  email: string
  phone: string
  occasion: string
  preferredDate: string
  preferredTime: string
  servings: string
  flavor: string
  styleDescription: string
  cakeMessage: string
  budgetRange: string
  specialInstructions: string
}

export type ReferenceImage = {
  id: string
  file: File
  previewUrl: string
}

export type CustomCakeRequest = Omit<CustomCakeFormValues, 'servings'> & {
  servings: number
  referenceImages: ReferenceImage[]
}
