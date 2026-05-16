import { withApiBase } from './baseUrl'

export type ClaudeExplainInput = {
  imageUrl: string
  title: string
  artist: string
}

export type ClaudeExplainResponse = {
  text: string
  model?: string
}

export async function fetchClaudeExplanation(
  input: ClaudeExplainInput,
): Promise<ClaudeExplainResponse> {
  const res = await fetch(withApiBase('/api/claude/explain'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const text = await res.text()
    let message = text

    try {
      const parsed = JSON.parse(text) as { message?: string }
      if (parsed?.message) message = parsed.message
    } catch {
      message = text
    }

    throw new Error(message || `Claude explain failed: ${res.status}`)
  }

  return res.json()
}
