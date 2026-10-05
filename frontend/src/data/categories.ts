export type ProductCategory = {
  id: string
  name: string
  description: string
  imageLabel: string
  href: string
}

export const categories: ProductCategory[] = [
  { id: 'birthday-cakes', name: 'Birthday Cakes', description: 'A centrepiece for their day.', imageLabel: 'Cakes', href: '/menu?category=birthday-cakes' },
  { id: 'custom-cakes', name: 'Custom Cakes', description: 'Made around your moment.', imageLabel: 'Custom', href: '/custom-cakes' },
  { id: 'pastries', name: 'Pastries', description: 'Little layers of joy.', imageLabel: 'Pastries', href: '/menu?category=pastries' },
  { id: 'cupcakes', name: 'Cupcakes', description: 'Small treats, big smiles.', imageLabel: 'Cupcakes', href: '/menu?category=cupcakes' },
  { id: 'brownies', name: 'Brownies', description: 'Fudgy, rich and generous.', imageLabel: 'Brownies', href: '/menu?category=brownies' },
  { id: 'cookies', name: 'Cookies', description: 'For the sweet pause.', imageLabel: 'Cookies', href: '/menu?category=cookies' },
  { id: 'desserts', name: 'Desserts', description: 'A soft landing after dinner.', imageLabel: 'Desserts', href: '/menu?category=desserts' },
  { id: 'sweets', name: 'Sweets', description: 'A little celebration, anytime.', imageLabel: 'Sweets', href: '/menu?category=sweets' },
  { id: 'seasonal-specials', name: 'Seasonal Specials', description: 'Limited-time little pleasures.', imageLabel: 'Seasonal', href: '/menu?category=seasonal-specials' },
  { id: 'other-products', name: 'Other Products', description: 'More ways to make it sweet.', imageLabel: 'More', href: '/menu?category=other-products' },
]
