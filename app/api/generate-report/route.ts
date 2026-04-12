import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreColor, scoreLabel } from '@/types'
import { formatDate, verticalLabel } from '@/lib/utils'
import type { AreaScore, Area, Building, Company } from '@/types'

export async function POST(req: Request) {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { inspection_id } = await req.json()
    if (!inspection_id) return NextResponse.json({ error: 'inspection_id required' }, { status: 400 })

    const admin = createAdminClient()

    // Load inspection with all area scores
    const { data: inspection } = await admin
      .from('inspections')
      .select(`
        *,
        buildings(*, companies(*)),
        area_scores(*, areas(*))
      `)
      .eq('id', inspection_id)
      .single()

    if (!inspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })

    const building = inspection.buildings as Building & { companies: Company }
    const company = building.companies

    // Verify ownership
    if (company.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const areaScores = inspection.area_scores as (AreaScore & { areas: Area })[]

    if (areaScores.length === 0) {
      return NextResponse.json({ error: 'No area scores to report' }, { status: 400 })
    }

    // Compute overall score
    const overallScore = areaScores.reduce((sum, s) => sum + s.overall_score, 0) / areaScores.length

    // Update inspection with final score and status
    await admin
      .from('inspections')
      .update({
        overall_score: Math.round(overallScore * 10) / 10,
        status: 'sent',
      })
      .eq('id', inspection_id)

    // Build email HTML
    const html = buildReportEmail({
      building,
      company,
      areaScores,
      overallScore,
      inspectionDate: inspection.inspection_date,
      inspectionId: inspection_id,
    })

    // Send via Resend
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const { error: sendErr } = await resend.emails.send({
      from: `${company.name} Quality Reports <reports@sightproof.io>`,
      to: building.manager_email,
      subject: `Service Verification Report — ${building.name} — ${formatDate(inspection.inspection_date)}`,
      html,
    })

    if (sendErr) {
      console.error('[generate-report] Resend error:', sendErr)
      return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, overall_score: overallScore })
  } catch (err: unknown) {
    console.error('[generate-report]', err)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}

// ─── Email Template ───────────────────────────────────────────────────────────

function buildReportEmail({
  building,
  company,
  areaScores,
  overallScore,
  inspectionDate,
  inspectionId,
}: {
  building: Building & { companies: Company }
  company: Company
  areaScores: (AreaScore & { areas: Area })[]
  overallScore: number
  inspectionDate: string
  inspectionId: string
}): string {
  const scoreHex = scoreColor(overallScore)
  const label = scoreLabel(overallScore)
  const dateStr = formatDate(inspectionDate)
  const vertical = verticalLabel(company.vertical)

  const areaRows = areaScores
    .sort((a, b) => a.overall_score - b.overall_score) // worst first for action focus
    .map((s) => {
      const hex = scoreColor(s.overall_score)
      const flagsHtml = s.flags.length
        ? `<p style="margin:4px 0 0;font-size:12px;color:#EF4444;">${s.flags.map((f) => `⚠ ${f}`).join(' · ')}</p>`
        : ''
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #F1F5F9;">
            <span style="font-weight:700;font-size:14px;color:#0F172A;">${s.areas?.name ?? 'Area'}</span>
            <br/><span style="font-size:12px;color:#94A3B8;">${s.summary}</span>
            ${flagsHtml}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #F1F5F9;text-align:center;white-space:nowrap;">
            <span style="background:${hex}22;color:${hex};font-weight:800;font-size:16px;padding:4px 12px;border-radius:8px;">
              ${s.overall_score.toFixed(1)}
            </span>
          </td>
        </tr>
      `
    })
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Outfit',ui-sans-serif,system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

  <!-- Header -->
  <tr>
    <td style="background:#1E3A5F;border-radius:20px 20px 0 0;padding:32px;">
      <p style="margin:0 0 4px;color:#94A3B8;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Service Verification Report</p>
      <h1 style="margin:0 0 4px;color:#FFFFFF;font-size:24px;font-weight:800;">${building.name}</h1>
      <p style="margin:0;color:#94A3B8;font-size:14px;">${dateStr} &nbsp;·&nbsp; ${vertical}</p>
      <p style="margin:8px 0 0;color:#64748B;font-size:13px;">Verified by <strong style="color:#0D9488;">${company.name}</strong></p>
    </td>
  </tr>

  <!-- Overall score band -->
  <tr>
    <td style="background:#FFFFFF;padding:28px 32px;text-align:center;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#64748B;letter-spacing:1px;text-transform:uppercase;">Overall Score</p>
      <p style="margin:0;font-size:64px;font-weight:900;color:${scoreHex};line-height:1.1;">${overallScore.toFixed(1)}</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:${scoreHex};">${label}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#94A3B8;">${areaScores.length} area${areaScores.length !== 1 ? 's' : ''} inspected</p>
    </td>
  </tr>

  <!-- Area breakdown table -->
  <tr>
    <td style="background:#FFFFFF;padding:0 0 8px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
      <p style="margin:0;padding:16px 24px 8px;font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:2px;text-transform:uppercase;">Area Breakdown</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr style="background:#F8FAFC;">
          <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Area</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Score</th>
        </tr>
        ${areaRows}
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:0 0 20px 20px;padding:24px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;">
        Questions about this report? Reply to this email or contact ${company.name} directly.
      </p>
      <p style="margin:0;font-size:11px;color:#CBD5E1;">
        Report ID: ${inspectionId} &nbsp;·&nbsp; Powered by <span style="color:#0D9488;font-weight:700;">SightProof</span>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
