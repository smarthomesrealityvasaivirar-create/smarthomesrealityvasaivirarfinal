-- Seed: the 8 demo listings (placeholder Unsplash photos). Run AFTER migrations 001-004.
-- Safe to re-run: skips rows whose slug already exists.

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-001', 'spacious-2bhk-tirupati-nagar-virar-west', 'Spacious 2BHK Apartment with Balcony', 'rent', 'apartment', '2BHK', 16500, 'per_month', true, 780, 'carpet', 'Tirupati Nagar Phase II, Virar West', 'Vasai-Virar', 'B-Wing, Near Canara Bank, Tirupati Nagar Phase 2, Virar West, Maharashtra 401303', 4, 14, 2, 2, 2, 1, 'semi-furnished', 'family', false, 3, '2026-11-01', 'Beautifully maintained 2BHK flat in prime Tirupati Nagar, Virar West. Features modular kitchen, piped gas connection, master bedroom with attached bathroom, spacious French windows with garden view, and 24/7 security with power backup. Walking distance to bus stop, auto stand, and markets.', array['5 mins from Virar Railway Station','Modular kitchen with piped gas connection','Both bathrooms with western fittings and geysers','High-speed elevators with generator power backup','24/7 security with CCTV monitoring & intercom']::text[], array['Lift','Power Backup','Security / CCTV','Reserved Parking','Children Play Area','Piped Gas','Water Storage (24h)','Intercom Facility']::text[], 'published', true, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 'Living room view', 0, true),
  ('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'Building exterior', 1, false),
  ('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80', 'Modular kitchen', 2, false),
  ('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Master bedroom', 3, false)
) as v(url, alt, ord, cover);

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-002', 'cozy-1bhk-bolinj-virar-west', 'Modern 1BHK Flat Near D-Mart', 'rent', 'apartment', '1BHK', 9500, 'per_month', false, 460, 'carpet', 'Bolinj, Virar West', 'Vasai-Virar', 'Wing C, Evershine Avenue, Bolinj Naka, Virar West, Maharashtra 401303', 7, 12, 1, 2, 1, 1, 'unfurnished', 'any', true, 2, '2026-10-25', 'Well-ventilated 1BHK apartment in a peaceful gated community at Bolinj, Virar West. Located within 2 minutes walk from D-Mart and local grocery supermarkets. Ideal for working professionals and small families.', array['Opposite D-Mart Bolinj','Spacious living room with private balcony','Separate bath and western WC','Low society maintenance charges','Gated society with biometric / security guard access']::text[], array['Lift','Security / CCTV','Water Storage (24h)','Bike Parking','Fire Fighting System']::text[], 'published', true, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'Living room', 0, true),
  ('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 'Bedroom', 1, false),
  ('https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', 'Kitchen space', 2, false)
) as v(url, alt, ord, cover);

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-003', 'luxury-3bhk-global-city-virar-west', 'Luxury 3BHK Penthouse with Club Access', 'rent', 'apartment', '3BHK', 24000, 'per_month', true, 1150, 'carpet', 'Global City, Virar West', 'Vasai-Virar', 'Tower 4, Rustomjee Global City, Near Club One, Virar West, Maharashtra 401303', 12, 14, 3, 3, 3, 2, 'furnished', 'family', false, 4, '2026-11-15', 'Spectacular fully-furnished 3BHK home inside Rustomjee Global City township. Overlooking the lush gardens and clubhouse. Comes with complete sofa set, dining table, 3 AC units, double beds with wardrobes, and fully equipped kitchen.', array['Access to Club One luxury clubhouse & swimming pool','Fully furnished with designer interiors','Panoramic sunset views from top floor','Township with Yazoo Park, international school, and hospital','Covered car parking included']::text[], array['Swimming Pool','Gym / Fitness Centre','Clubhouse','Lift','Security / CCTV','Children Play Area','Jogging Track','Covered Parking','Power Backup']::text[], 'published', true, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Living room', 0, true),
  ('https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', 'Dining & kitchen', 1, false),
  ('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'Bedroom', 2, false),
  ('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', 'Balcony view', 3, false)
) as v(url, alt, ord, cover);

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-004', 'vinay-unique-sky-2bhk-virar-west', 'Brand New 2BHK at Vinay Unique Sky', 'buy', 'apartment', '2BHK', 43.5, 'lacs', true, 685, 'carpet', 'Yashwant Nagar, Virar West', 'Vasai-Virar', 'Tower A, Vinay Unique Sky, Yashwant Nagar Road, Virar West, Maharashtra 401303', 9, 22, 2, 2, 1, 1, 'unfurnished', 'any', false, 0, '2026-10-30', 'High-rise luxury residence at Vinay Unique Sky with clear sky and greenery views. Full OC received, RERA approved project. High speed branded lifts, earthquake-resistant RCC structure, and top-tier amenities.', array['Full OC Received & Clear Title','RERA Registered: P51900018320','All major nationalized banks home loan approved (SBI, HDFC, ICICI)','10 minutes direct auto to Virar Station','Podium garden with jogging track & outdoor gym']::text[], array['Gym / Fitness Centre','Lift','Children Play Area','Security / CCTV','Power Backup','Rainwater Harvesting','Fire Fighting System']::text[], 'published', true, 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80', 'Tower facade', 0, true),
  ('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 'Living area', 1, false)
) as v(url, alt, ord, cover);

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-005', 'affordable-1bhk-evershine-city-vasai-east', 'Sunny 1BHK in Evershine City Vasai East', 'buy', 'apartment', '1BHK', 31, 'lacs', true, 520, 'built_up', 'Evershine City, Vasai East', 'Vasai-Virar', 'Sector 3, Evershine City, Vasai East, Maharashtra 401208', 3, 7, 1, 1, 1, 1, 'semi-furnished', 'any', true, 5, '2026-10-22', 'Prime resale property in well-established Evershine City, Vasai East. Direct connection to Western Express Highway and Vasai Station. Clean title society with low maintenance. Price is open to genuine negotiation.', array['Immediate possession available','Near Broadway Shopping Centre & schools','Easy connectivity to Mumbai-Ahmedabad Highway (NH 48)','Water supply assured with municipal connection']::text[], array['Lift','Water Storage (24h)','Security / CCTV','Bike Parking']::text[], 'published', false, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Living room', 0, true)
) as v(url, alt, ord, cover);

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-006', 'prime-commercial-shop-station-road-virar-west', 'Main Road Facing Commercial Shop', 'rent', 'commercial', null, 35000, 'per_month', false, 280, 'carpet', 'Station Road, Virar West', 'Vasai-Virar', 'Ground Floor, Agarwal Market, Station Road, Virar West, Maharashtra 401303', 0, 4, null, 1, null, 1, 'unfurnished', 'any', true, 6, '2026-11-01', 'High footfall ground floor commercial shop right on Virar Station Road. 12-foot frontage with rolling shutter, high ceiling, private washroom, and heavy 3-phase electricity. Perfect for pharmacy, clinic, boutique, or grocery mart.', array['Direct main road frontage with thousands of daily commuters','2 minutes walk from Virar West railway station exit','Private water connection & washroom','Heavy commercial electrical load sanction']::text[], array['Water Storage (24h)','Reserved Parking','Fire Fighting System']::text[], 'published', false, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'Shop front', 0, true)
) as v(url, alt, ord, cover);

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-007', 'semi-furnished-2bhk-stella-vasai-west', 'Elegant 2BHK Near Stella Petrol Pump', 'rent', 'apartment', '2BHK', 18000, 'per_month', true, 820, 'carpet', 'Stella, Vasai West', 'Vasai-Virar', 'Green Meadows, Ambadi Road, Stella, Vasai West, Maharashtra 401202', 5, 10, 2, 2, 2, 1, 'semi-furnished', 'bachelor', false, 3, '2026-10-28', 'Centrally located 2BHK in Stella, Vasai West. Close to ICICI Bank, premium restaurants, hospitals, and reputed English medium schools. Features modern wardrobe in master room, modular kitchen, and private covered car park.', array['Prime Vasai West location on Ambadi Road artery','Covered car parking included in rent','24-hour drinking water supply from VVCMC','Walking distance to Vasai railway station (10 mins)']::text[], array['Lift','Power Backup','Covered Parking','Security / CCTV','Piped Gas','Intercom Facility']::text[], 'published', true, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 'Interior', 0, true)
) as v(url, alt, ord, cover);

with ins as (
  insert into public.properties (reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
  values ('SHR-2026-008', 'residential-plot-chikhal-dongri-virar-west', 'Clear Title Residential NA Plot for Sale', 'buy', 'plot', null, 38, 'lacs', true, 1800, 'plot_area', 'Chikhal Dongri Road, Virar West', 'Vasai-Virar', 'Survey 42, Chikhal Dongri, Virar West, Maharashtra 401303', null, null, null, null, null, null, null, 'any', true, 0, '2026-10-22', 'Collector-approved NA residential plot with clear demarcation, 20-foot concrete internal road, and water & electricity lines at the site. Ideal for building your independent dream bungalow or holiday home near Arnala Beach.', array['100% Clear Title & 7/12 Extract available','Collector Non-Agricultural (NA) sanction','10 mins drive to Arnala Beach & resorts','Demarcated compound wall and boundary markers']::text[], array['Water Storage (24h)','Security / CCTV']::text[], 'published', false, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')
  on conflict (slug) do nothing
  returning id
)
insert into public.property_images (property_id, url, alt_text, display_order, is_cover)
select ins.id, v.url, v.alt, v.ord, v.cover from ins, (values
  ('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'Plot panorama', 0, true)
) as v(url, alt, ord, cover);

-- keep the reference sequence ahead of the seeded SHR-2026-00X numbers
select setval('public.property_ref_seq', greatest(
  (select last_value from public.property_ref_seq),
  coalesce((select max((regexp_match(reference_number, '^SHR-[0-9]{4}-([0-9]+)$'))[1]::bigint) from public.properties), 1)
));
