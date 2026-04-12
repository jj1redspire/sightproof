import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { photo_url, area_id, area_name, area_type, vertical, inspection_id } = await req.json()

    if (!photo_url || !area_id || !inspection_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Load industry template for criteria
    const { data: template } = await admin
      .from('industry_templates')
      .select('scoring_criteria_json, report_header_text')
      .eq('vertical_name', vertical)
      .eq('area_type', area_type)
      .maybeSingle()

    const criteria = template?.scoring_criteria_json as Record<string, string> | null ?? {}
    const criteriaList = Object.entries(criteria).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')

    const systemPrompt = `You are a commercial property quality inspector AI. Analyze the photo and score each criterion on a scale of 1–10.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "overall_score": <number 1-10, one decimal>,
  "criteria_scores": {
    "<criterion_key>": { "score": <1-10 integer>, "note": "<one sentence observation>" }
  },
  "summary": "<2-3 sentence overall assessment>",
  "flags": ["<issue 1>", "<issue 2>"] // empty array if none
}

Area being inspected: ${area_name} (${area_type})
Service vertical: ${vertical}

Scoring criteria:
${criteriaList || '- general_cleanliness: Overall cleanliness and presentation\n- condition: Physical condition and maintenance\n- compliance: Meets expected service standards'}

Be objective and precise. A score of 10 means exceptional — spotless, nothing missed. Score of 1 means severe issues requiring immediate re-service.`

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: photo_url },
            },
            {
              type: 'text',
              text: 'Score this area according to the criteria in your instructions. Return only the JSON.',
            },
          ],
        },
      ],
      system: systemPrompt,
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    let result: {
      overall_score: number
      criteria_scores: Record<string, { score: number; note: string }>
      summary: string
      flags: string[]
    }

    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      console.error('[score] Failed to parse AI response:', raw)
      return NextResponse.json({ error: 'AI response parse error' }, { status: 500 })
    }

    // Clamp score to valid range
    result.overall_score = Math.max(1, Math.min(10, result.overall_score))

    // Upsert area_score row
    const { error: dbErr } = await admin
      .from('area_scores')
      .upsert({
        inspection_id,
        area_id,
        photo_url,
        overall_score: result.overall_score,
        criteria_scores: result.criteria_scores,
        summary: result.summary,
        flags: result.flags,
        scored_at: new Date().toISOString(),
      }, { onConflict: 'inspection_id,area_id' })

    if (dbErr) console.error('[score] DB upsert error:', dbErr)

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('[score]', err)
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 })
  }
}
