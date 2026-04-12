-- SightProof Initial Schema
create extension if not exists "pgcrypto";

-- =============================================
-- COMPANIES
-- =============================================
create table if not exists companies (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  logo_url   text,
  vertical   text not null check (vertical in ('cleaning','landscaping','snow_removal','pressure_washing','commercial_kitchen')),
  created_at timestamptz not null default now()
);
alter table companies enable row level security;
create policy "owners manage company" on companies for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- =============================================
-- BUILDINGS
-- =============================================
create table if not exists buildings (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  name          text not null,
  address       text,
  manager_email text not null,
  manager_token text unique not null default gen_random_uuid()::text,
  created_at    timestamptz not null default now()
);
alter table buildings enable row level security;
create policy "owners manage buildings" on buildings for all
  using (exists (select 1 from companies where companies.id = buildings.company_id and companies.owner_id = auth.uid()))
  with check (exists (select 1 from companies where companies.id = buildings.company_id and companies.owner_id = auth.uid()));

-- =============================================
-- AREAS
-- =============================================
create table if not exists areas (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  name        text not null,
  area_type   text not null,
  created_at  timestamptz not null default now()
);
alter table areas enable row level security;
create policy "owners manage areas" on areas for all
  using (exists (
    select 1 from buildings join companies on companies.id = buildings.company_id
    where buildings.id = areas.building_id and companies.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from buildings join companies on companies.id = buildings.company_id
    where buildings.id = areas.building_id and companies.owner_id = auth.uid()
  ));

-- =============================================
-- INDUSTRY TEMPLATES
-- =============================================
create table if not exists industry_templates (
  id                   uuid primary key default gen_random_uuid(),
  vertical_name        text not null,
  area_type            text not null,
  scoring_criteria_json jsonb not null,
  report_header_text   text,
  created_at           timestamptz not null default now(),
  unique (vertical_name, area_type)
);
alter table industry_templates enable row level security;
-- Public read — everyone can read templates
create policy "public read templates" on industry_templates for select using (true);

-- =============================================
-- INSPECTIONS
-- =============================================
create table if not exists inspections (
  id              uuid primary key default gen_random_uuid(),
  building_id     uuid not null references buildings(id) on delete cascade,
  inspector_name  text,
  inspection_date date not null default current_date,
  overall_score   numeric(3,1),
  status          text not null default 'in_progress' check (status in ('in_progress','complete','sent')),
  pdf_url         text,
  created_at      timestamptz not null default now()
);
alter table inspections enable row level security;
create policy "owners manage inspections" on inspections for all
  using (exists (
    select 1 from buildings join companies on companies.id = buildings.company_id
    where buildings.id = inspections.building_id and companies.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from buildings join companies on companies.id = buildings.company_id
    where buildings.id = inspections.building_id and companies.owner_id = auth.uid()
  ));

-- =============================================
-- AREA SCORES
-- =============================================
create table if not exists area_scores (
  id              uuid primary key default gen_random_uuid(),
  inspection_id   uuid not null references inspections(id) on delete cascade,
  area_id         uuid not null references areas(id),
  photo_url       text not null,
  overall_score   numeric(3,1) not null,
  criteria_scores jsonb not null default '{}',
  summary         text not null default '',
  flags           text[] not null default '{}',
  scored_at       timestamptz not null default now()
);
alter table area_scores enable row level security;
create policy "owners manage area_scores" on area_scores for all
  using (exists (
    select 1 from inspections
    join buildings on buildings.id = inspections.building_id
    join companies on companies.id = buildings.company_id
    where inspections.id = area_scores.inspection_id and companies.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from inspections
    join buildings on buildings.id = inspections.building_id
    join companies on companies.id = buildings.company_id
    where inspections.id = area_scores.inspection_id and companies.owner_id = auth.uid()
  ));

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
create table if not exists subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  stripe_customer_id  text,
  stripe_sub_id       text,
  plan_tier           text check (plan_tier in ('starter','growth','property_manager','enterprise')),
  status              text not null default 'trialing',
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
alter table subscriptions enable row level security;
create policy "owners read subscription" on subscriptions for select
  using (exists (select 1 from companies where companies.id = subscriptions.company_id and companies.owner_id = auth.uid()));
create policy "service role manages subscriptions" on subscriptions for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_buildings_company_id on buildings(company_id);
create index if not exists idx_areas_building_id on areas(building_id);
create index if not exists idx_inspections_building_id on inspections(building_id);
create index if not exists idx_inspections_date on inspections(inspection_date);
create index if not exists idx_area_scores_inspection_id on area_scores(inspection_id);
create index if not exists idx_buildings_manager_token on buildings(manager_token);

-- =============================================
-- SEED: INDUSTRY TEMPLATES
-- =============================================

-- CLEANING
insert into industry_templates (vertical_name, area_type, scoring_criteria_json, report_header_text) values
('cleaning','bathroom','{"floor_cleanliness":"Floor shine, no debris or stains","fixtures":"Sinks, toilets, mirrors clean and streak-free","dispensers":"Soap, paper towels, toilet paper refilled","trash":"Bins emptied, fresh liner","surfaces":"Counters wiped, no water spots"}','Commercial restroom inspection'),
('cleaning','lobby','{"floor_cleanliness":"Floor shine, vacuumed/mopped, no debris","surfaces":"Reception desk, tables dusted and clean","glass":"Entry doors and windows streak-free","trash":"Bins emptied","overall_appearance":"Clutter-free, inviting appearance"}','Building lobby inspection'),
('cleaning','office','{"floor_cleanliness":"Carpet vacuumed or hard floor mopped","trash":"All bins emptied with fresh liners","surfaces":"Desks undisturbed unless contracted, surfaces wiped","overall_appearance":"General tidiness and organization"}','Office area inspection'),
('cleaning','kitchen','{"counters":"All surfaces wiped and sanitized","appliances":"Microwave, fridge exterior, coffee maker clean","sink":"Clean, no standing dishes","floor":"Swept and mopped","trash":"Bin emptied, fresh liner"}','Kitchen/break room inspection')
ON CONFLICT (vertical_name, area_type) DO NOTHING;

-- LANDSCAPING
insert into industry_templates (vertical_name, area_type, scoring_criteria_json, report_header_text) values
('landscaping','lawn','{"grass_height":"Even mowing height, no missed patches","edging":"Clean edges along walkways and beds","debris":"Clippings collected, no litter","overall_appearance":"Uniform, healthy appearance"}','Lawn maintenance inspection'),
('landscaping','beds','{"mulch":"Fresh, even coverage","weeds":"Minimal to no visible weeds","plants":"Trimmed, healthy, no dead material","edging":"Clean bed borders"}','Landscape bed inspection'),
('landscaping','common_area','{"walkways":"Clear of debris and overgrowth","hedges":"Evenly trimmed","trash":"No visible litter or debris","overall_appearance":"Well-maintained appearance"}','Common area inspection')
ON CONFLICT (vertical_name, area_type) DO NOTHING;

-- SNOW REMOVAL
insert into industry_templates (vertical_name, area_type, scoring_criteria_json, report_header_text) values
('snow_removal','parking_lot','{"clearance":"Full lot cleared, no snow pack","salt_application":"Even salt/sand coverage","ice_spots":"No visible ice patches","pile_placement":"Snow piled away from traffic, not blocking views"}','Parking lot snow/ice removal'),
('snow_removal','sidewalk','{"clearance":"Full width cleared","salt_application":"De-icing applied","ada_access":"Ramps and accessible routes clear","trip_hazards":"No ice ridges or uneven surfaces"}','Sidewalk clearing inspection'),
('snow_removal','entrance','{"clearance":"Full clearance to door","de_icing":"Salt/sand applied","drainage":"No standing water or refreeze risk","mat_area":"Entry mat area clear and safe"}','Building entrance inspection')
ON CONFLICT (vertical_name, area_type) DO NOTHING;

-- PRESSURE WASHING (generic fallback)
insert into industry_templates (vertical_name, area_type, scoring_criteria_json, report_header_text) values
('pressure_washing','facade','{"surface_cleanliness":"No visible grime, staining, or residue","rinse_quality":"Even rinse, no streaking","detail_areas":"Corners, seams, and joints addressed","overall_appearance":"Clean, uniform appearance"}','Pressure washing quality inspection'),
('pressure_washing','parking_lot','{"surface_cleanliness":"Oil stains, debris, and grime removed","coverage":"Full lot coverage, no missed sections","rinse":"Clean rinse, no pooling","overall_appearance":"Visibly cleaner than pre-service"}','Parking lot pressure wash inspection')
ON CONFLICT (vertical_name, area_type) DO NOTHING;

-- COMMERCIAL KITCHEN
insert into industry_templates (vertical_name, area_type, scoring_criteria_json, report_header_text) values
('commercial_kitchen','hood','{"grease_removal":"Filters and hood interior free of grease buildup","duct_clearance":"Duct clear and unobstructed","exterior":"Hood exterior wiped clean","compliance":"Meets health code standard"}','Kitchen hood/exhaust inspection'),
('commercial_kitchen','cook_line','{"grill_surfaces":"Grill grates and flat top cleaned and degreased","equipment":"All appliances cleaned inside and out","floors":"Rubber mats removed, floor scrubbed","overall":"No residue or cross-contamination risk"}','Cook line deep clean inspection')
ON CONFLICT (vertical_name, area_type) DO NOTHING;
