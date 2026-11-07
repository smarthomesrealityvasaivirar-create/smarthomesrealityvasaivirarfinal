import type { Enquiry, SellRequest } from '@/types/lead'

/** Demo-mode leads only. Real leads live in Supabase. */
export const MOCK_ENQUIRIES: Enquiry[] = [
  { id: 'enq-1', name: 'Rahul Sharma', phone: '9820144521', email: null, message: 'Can I visit the Tirupati Nagar 2BHK on Saturday evening?', visit_date: '2026-11-07', enquiry_type: 'property_visit', property_id: 'prop-1', property_title: 'Spacious 2BHK Apartment with Balcony', property_ref: 'SHR-2026-001', status: 'new', notes: null, created_at: '2026-11-05T05:30:00Z', updated_at: '2026-11-05T05:30:00Z' },
  { id: 'enq-2', name: 'Pooja Varma', phone: '9769012890', email: 'pooja@example.com', message: '1BHK under 10k near Virar station, ready to move.', visit_date: null, enquiry_type: 'general', property_id: null, property_title: null, property_ref: null, status: 'contacted', notes: 'Shared 3 options on WhatsApp', created_at: '2026-11-03T11:15:00Z', updated_at: '2026-11-03T17:00:00Z' },
  { id: 'enq-3', name: 'Amitabh Deshmukh', phone: '9833456789', email: null, message: 'Maintenance and deposit for the Global City 3BHK?', visit_date: '2026-11-08', enquiry_type: 'property_visit', property_id: 'prop-3', property_title: 'Luxury 3BHK Penthouse with Club Access', property_ref: 'SHR-2026-003', status: 'visit_scheduled', notes: 'Sunday 11 AM, Yash', created_at: '2026-11-02T09:45:00Z', updated_at: '2026-11-02T10:00:00Z' },
]

export const MOCK_SELL_REQUESTS: SellRequest[] = [
  { id: 'sell-1', owner_name: 'Suresh Patil', phone: '9821290876', email: null, property_type: '2BHK Flat', city: 'Vasai-Virar', locality: 'Viva College Road, Virar West', intention: 'sell', expected_price: '₹48 Lacs', description: '750 sq ft carpet, 5th floor, OC received.', status: 'new', notes: null, property_id: null, created_at: '2026-11-04T10:00:00Z', updated_at: '2026-11-04T10:00:00Z' },
  { id: 'sell-2', owner_name: 'Sunita Joshi', phone: '9819943210', email: null, property_type: '1BHK Flat', city: 'Vasai-Virar', locality: 'Bolinj Naka, Virar West', intention: 'rent_out', expected_price: '₹10,500 / month', description: 'Freshly painted, semi-furnished.', status: 'contacted', notes: null, property_id: null, created_at: '2026-11-01T15:20:00Z', updated_at: '2026-11-01T15:20:00Z' },
]
