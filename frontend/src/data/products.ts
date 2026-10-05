export type Product = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price: number
  image?: string
  imageLabel: string
  isFeatured: boolean
  isAvailable: boolean
  flavor?: string
  eggless?: boolean
  preparationTime?: string
  minimumAdvanceNotice?: string
}

export const featuredProducts: Product[] = [
  { id: 'truffle-cake', name: 'Chocolate Truffle Cake', slug: 'chocolate-truffle-cake', description: 'Deep cocoa sponge with a glossy ganache finish.', category: 'Birthday Cakes', price: 850, imageLabel: 'Chocolate / Truffle', isFeatured: true, isAvailable: true, flavor: 'Dark chocolate', eggless: true, preparationTime: '1 day', minimumAdvanceNotice: '24 hours' },
  { id: 'strawberry-cream', name: 'Strawberry Cream Cake', slug: 'strawberry-cream-cake', description: 'Soft vanilla layers with berry cream and fresh notes.', category: 'Birthday Cakes', price: 950, imageLabel: 'Strawberry / Cream', isFeatured: true, isAvailable: true, flavor: 'Strawberry and vanilla', preparationTime: '1 day', minimumAdvanceNotice: '24 hours' },
  { id: 'red-velvet', name: 'Red Velvet Cake', slug: 'red-velvet-cake', description: 'Velvety cocoa crumb with a smooth cream cheese-style finish.', category: 'Birthday Cakes', price: 900, imageLabel: 'Red velvet / Cocoa', isFeatured: true, isAvailable: false, flavor: 'Cocoa and vanilla', preparationTime: '1 day', minimumAdvanceNotice: '48 hours' },
  { id: 'brownie-box', name: 'Classic Brownie Box', slug: 'classic-brownie-box', description: 'A fudgy box for sharing, gifting or keeping close.', category: 'Brownies', price: 420, imageLabel: 'Cocoa / Brownie', isFeatured: true, isAvailable: true, flavor: 'Cocoa', eggless: true, preparationTime: 'Same day', minimumAdvanceNotice: '12 hours' },
  { id: 'vanilla-cupcake-box', name: 'Vanilla Celebration Cupcakes', slug: 'vanilla-celebration-cupcakes', description: 'Soft vanilla cupcakes finished for small celebrations.', category: 'Cupcakes', price: 480, imageLabel: 'Vanilla / Cupcakes', isFeatured: false, isAvailable: true, flavor: 'Vanilla', preparationTime: 'Same day', minimumAdvanceNotice: '12 hours' },
  { id: 'berry-pastry-box', name: 'Berry Pastry Box', slug: 'berry-pastry-box', description: 'A delicate selection of pastry-sized sweet treats.', category: 'Pastries', price: 560, imageLabel: 'Berry / Pastries', isFeatured: false, isAvailable: true, flavor: 'Seasonal berry', preparationTime: '1 day', minimumAdvanceNotice: '24 hours' },
  { id: 'butter-cookies', name: 'Butter Cookie Tin', slug: 'butter-cookie-tin', description: 'A crisp, buttery companion for tea and gifting.', category: 'Cookies', price: 360, imageLabel: 'Butter / Cookies', isFeatured: false, isAvailable: true, flavor: 'Butter and vanilla', eggless: true, preparationTime: 'Same day', minimumAdvanceNotice: '12 hours' },
  { id: 'seasonal-sweet-box', name: 'Seasonal Sweet Box', slug: 'seasonal-sweet-box', description: 'A rotating selection for the season’s sweetest occasions.', category: 'Seasonal Specials', price: 650, imageLabel: 'Seasonal / Sweets', isFeatured: false, isAvailable: false, preparationTime: 'By request', minimumAdvanceNotice: '48 hours' },
]

export const favouriteProducts = featuredProducts.slice(0, 3)
