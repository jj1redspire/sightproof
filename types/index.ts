export type Vertical = 'cleaning' | 'landscaping' | 'snow_removal' | 'pressure_washing' | 'commercial_kitchen'

export type Company = {
  id: string
  owner_id: string
  name: string
  logo_url: string | null
  vertical: Vertical
  created_at: string
}

export type Building = {
  id: string
  company_id: string
  name: string
  address: string | null
  manager_email: string
  manager_token: string
  created_at: string
}

export type Area = {
  id: string
  building_id: string
  name: string
  area_type: string
  created_at: string
}

export type InspectionStatus = 'in_progress' | 'complete' | 'sent'

export type Inspection = {
  id: string
  building_id: string
  inspector_name: string | null
  inspection_date: string
  overall_score: number | null
  status: InspectionStatus
  pdf_url: string | null
  created_at: string
}

export type CriterionScore = {
  score: number
  note: string
}

export type AreaScore = {
  id: string
  inspection_id: string
  area_id: string
  photo_url: string
  overall_score: number
  criteria_scores: Record<string, CriterionScore>
  summary: string
  flags: string[]
  scored_at: string
}

export type Subscription = {
  id: string
  company_id: string
  stripe_customer_id: string
  stripe_sub_id: string
  plan_tier: 'starter' | 'growth' | 'property_manager' | 'enterprise'
  status: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export type InspectionWithScores = Inspection & {
  area_scores: (AreaScore & { areas: Pick<Area, 'name' | 'area_type'> })[]
  buildings: Pick<Building, 'name' | 'address' | 'manager_email'>
}

// Score color helpers
export function scoreColor(score: number): string {
  if (score >= 8) return '#0D9488'   // teal — good
  if (score >= 6) return '#F59E0B'   // amber — acceptable
  return '#EF4444'                    // red — below standard
}

export function scoreBgClass(score: number): string {
  if (score >= 8) return 'bg-teal-100 text-teal-700'
  if (score >= 6) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
}

export function scoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Good'
  if (score >= 6) return 'Acceptable'
  if (score >= 4) return 'Below Standard'
  return 'Unacceptable'
}
