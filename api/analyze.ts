import OpenAI from "openai";
import fs from "fs";
import path from "path";

function getOpenAiKey() {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }

  const envPaths = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".vercel", ".env.development.local"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const envText = fs.readFileSync(envPath, "utf-8");
      const line = envText
        .split("\n")
        .find((item) => item.startsWith("OPENAI_API_KEY="));

      if (line) {
        return line.replace("OPENAI_API_KEY=", "").trim();
      }
    }
  }

  return "";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 가능합니다." });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "질문 내용이 없습니다." });
    }

    const apiKey = getOpenAiKey();

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
당신은 30년 이상 경력의 사주명리 상담 전문가입니다.
사용자의 사주팔자, 오행, 십성, 격국, 용신, 희신, 기신, 세운, 대운 정보를 바탕으로 현실적이고 따뜻한 상담을 작성하세요.
단정적인 예언보다 실제 삶에 도움이 되는 조언형으로 답변하세요.
답변은 최소 1000자 이상 작성하세요.
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      "AI 답변을 생성하지 못했습니다.";

    return res.status(200).json({
      result: answer,
    });
  } catch (error) {
    console.error("OpenAI API 오류:", error);

    return res.status(500).json({
      error: "AI 상담 중 서버 오류가 발생했습니다.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}