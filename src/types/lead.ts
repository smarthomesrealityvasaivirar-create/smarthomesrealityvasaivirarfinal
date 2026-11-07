export type EnquiryType = 'general' | 'property_visit' | 'callback'
export type EnquiryStatus = 'new' | 'contacted' | 'visit_scheduled' | 'converted' | 'lost'
export type SellRequestStatus = 'new' | 'contacted' | 'approved' | 'rejected' | 'listed'

export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'contacted', 'visit_scheduled', 'converted', 'lost']
export const SELL_STATUSES: SellRequestStatus[] = ['new', 'contacted', 'approved', 'rejected', 'listed']

export interface Enquiry {
  id: string
  name: string
  phone: string
  email: string | null
  message: string | null
  visit_date: string | null
  enquiry_type: EnquiryType
  property_id: string | null
  property_title: string | null
  property_ref: string | null
  status: EnquiryStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SellRequest {
  id: string
  owner_name: string
  phone: string
  email: string | null
  property_type: string
  city: string
  locality: string
  intention: 'sell' | 'rent_out'
  expected_price: string | null
  description: string | null
  status: SellRequestStatus
  notes: string | null
  property_id: string | null
  created_at: string
  updated_at: string
}
