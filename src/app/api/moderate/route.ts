import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const resp = await client.moderations.create({ model: 'omni-moderation-latest', input: text })
    const flagged = (resp.results?.[0]?.flagged ?? false) as boolean
    return NextResponse.json({ flagged })
  } catch (e:any) {
    return NextResponse.json({ flagged: false, error: e.message || 'err' }, { status: 500 })
  }
}
