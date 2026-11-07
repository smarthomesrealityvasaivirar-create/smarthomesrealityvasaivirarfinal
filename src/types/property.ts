export type PropertyPurpose = 'buy' | 'rent'
export type PropertyCategory = 'apartment' | 'commercial' | 'plot'
export type PropertyStatus = 'draft' | 'published' | 'sold' | 'rented' | 'archived'
export type FurnishingStatus = 'unfurnished' | 'semi-furnished' | 'furnished'
export type AreaType = 'carpet' | 'built_up' | 'plot_area'
export type PriceUnit = 'lacs' | 'crores' | 'per_month' | 'per_sqft'
export type TenantPreference = 'any' | 'family' | 'bachelor'

export const PUBLIC_STATUSES: PropertyStatus[] = ['published', 'sold', 'rented']

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  storage_path: string | null
  alt_text: string | null
  display_order: number
  is_cover: boolean
  created_at: string
}

export interface Property {
  id: string
  reference_number: string
  slug: string
  title: string
  purpose: PropertyPurpose
  category: PropertyCategory
  bhk_type: string | null
  price: number
  price_unit: PriceUnit
  price_negotiable: boolean
  area_sqft: number | null
  area_type: AreaType | null
  locality: string
  city: string
  full_address: string | null
  floor: number | null
  total_floors: number | null
  bedrooms: number | null
  bathrooms: number | null
  balconies: number | null
  parking: number | null
  furnishing: FurnishingStatus | null
  tenant_preference: TenantPreference
  direct_owner: boolean
  age_years: number | null
  available_from: string | null
  description: string
  highlights: string[]
  amenities: string[]
  status: PropertyStatus
  featured: boolean
  cover_image_url: string | null
  created_at: string
  updated_at: string
  images: PropertyImage[]
}

/** Shape used by cards and list pages */
export type PropertyCard = Pick<
  Property,
  | 'id'
  | 'reference_number'
  | 'slug'
  | 'title'
  | 'purpose'
  | 'category'
  | 'bhk_type'
  | 'price'
  | 'price_unit'
  | 'area_sqft'
  | 'area_type'
  | 'locality'
  | 'city'
  | 'bedrooms'
  | 'bathrooms'
  | 'furnishing'
  | 'tenant_preference'
  | 'direct_owner'
  | 'status'
  | 'featured'
  | 'cover_image_url'
  | 'created_at'
> & { image_count: number }

export type SortKey = 'newest' | 'price_asc' | 'price_desc'

export interface PropertyFilters {
  purpose?: PropertyPurpose
  category?: PropertyCategory
  bhk?: string[]
  localities?: string[]
  furnished?: FurnishingStatus[]
  tenant?: TenantPreference
  directOwner?: boolean
  minPrice?: number
  maxPrice?: number
  featured?: boolean
}
