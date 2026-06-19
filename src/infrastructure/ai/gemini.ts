export interface AIProvider {
  generateSummary(prompt: string): Promise<string>
}

class GeminiProvider implements AIProvider {
  private apiKey: string

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? ''
  }

  async generateSummary(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('VITE_GEMINI_API_KEY não configurada. Adicione ao arquivo .env')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    )

    if (!response.ok) throw new Error(`Erro na API Gemini: ${response.statusText}`)

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Não foi possível gerar resumo.'
  }
}

export const aiService: AIProvider = new GeminiProvider()

export const aiPrompts = {
  acolhimento: (queixa: string, historico: string) =>
    `Você é um assistente clínico. Com base nas informações abaixo, gere um resumo clínico objetivo e profissional em português, em 3-4 frases:\n\nQueixa principal: ${queixa}\n\nHistórico: ${historico}\n\nResumo clínico:`,

  prontuario: (titulo: string, conteudo: string) =>
    `Você é um assistente clínico. Gere um resumo conciso e profissional da evolução abaixo em português, em 2-3 frases:\n\nTítulo: ${titulo}\n\nEvoluções: ${conteudo}\n\nResumo:`,
}
