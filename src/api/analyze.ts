/// <reference types="node" />
export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST 요청만 가능합니다." });
    }
  
    const apiKey = process.env.OPENAI_API_KEY;

  
    if (!apiKey) {
      return res.status(500).json({
        error: "서버에 OPENAI_API_KEY가 설정되지 않았습니다.",
      });
    }
  
    try {
      const { prompt } = req.body;
  
      if (!prompt) {
        return res.status(400).json({ error: "prompt가 없습니다." });
      }
  
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt,
          temperature: 0.7,
          max_output_tokens: 1200,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(500).json({
          error: "OpenAI API 오류",
          detail: errorText,
        });
      }
  
      const data = await response.json();
  
      const text =
        data.output_text ||
        data.output?.[0]?.content?.[0]?.text ||
        data.output?.[1]?.content?.[0]?.text ||
        data.output?.[0]?.content?.[0]?.value ||
        "";
  
      return res.status(200).json({
        text: text || JSON.stringify(data, null, 2),
      });
    } catch (error) {
      return res.status(500).json({
        error: "AI 상담 중 서버 오류가 발생했습니다.",
      });
    }
  }