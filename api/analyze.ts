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

function cleanAiConsultingText(text: string): string {
  if (!text) return "";

  let result = text;

  result = result
    .replaceAll("비견격", "혼자 해결하려는 성향")
    .replaceAll("신강", "스스로 밀어붙이는 힘")
    .replaceAll("용신", "삶을 안정시키는 요소")
    .replaceAll("희신", "도움이 되는 환경")
    .replaceAll("기신", "반복되는 약점")
    .replaceAll("일간", "타고난 성향")
    .replaceAll("화(火)", "강한 추진력")
    .replaceAll("토(土)", "현실적인 안정감")
    .replaceAll("오행", "기질의 흐름")
    .replace(/김광규님은/g, "당신은")
    .replace(/중요합니다\./g, "무엇보다 신경 써야 합니다.")
    .replace(/좋습니다\./g, "긍정적으로 이어질 가능성이 큽니다.")
    .replace(/필요합니다\./g, "실천하는 것이 좋겠습니다.")
    .replace(/\n{4,}/g, "\n\n\n");

  if (!result.includes("한마디로 말하면")) {
    result =
      "한마디로 말하면 지금은 강하게 밀고 나가기보다 삶의 중심을 다시 잡아야 하는 시기입니다.\n\n" +
      result;
  }

  if (!result.includes("최종 총평")) {
    result +=
      "\n\n최종 총평입니다. 앞으로 3년은 무리한 확장보다 중심을 세우고 사람과 일의 구조를 다시 잡는 데 집중해야 합니다.";
  }

  return result.trim();
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
          당신은 AI가 아닙니다.
          
          당신은 30년 이상 철학관을 운영하며 수많은 사람을 직접 상담한 원장입니다.
          
          당신의 목적은 사주를 설명하는 것이 아니라, 한 사람의 인생 흐름을 읽고 앞으로의 방향을 제시하는 것입니다.
          
          손님은 이미 자신의 사주 보고서를 모두 읽었습니다.
          
          따라서 비견격, 신강, 용신, 희신, 오행, 격국, 점수 같은 사주 용어를 다시 설명하지 마십시오.
          
          손님은 지금 철학관 상담실에서 원장과 마주 앉아 마지막 상담을 받고 있습니다.
          
          원장은 보고서를 읽지 않습니다.
          
          원장은 손님의 삶을 읽어줍니다.
          
          작성 방식:
          - 첫 문장은 반드시 "한마디로 말하면"으로 시작하십시오.
          - 마지막 문단은 반드시 "최종 총평"으로 시작하십시오.
          - 전체 답변은 최소 3000자 이상 작성하십시오.
          - 재물운, 직업운, 건강운, 연애운을 항목별로 나누지 마십시오.
          - 사주 용어 설명을 하지 말고, 현실의 삶과 선택으로 풀어 말하십시오.
          - 부드러운 위로만 하지 말고, 필요할 때는 단호하게 말하십시오.
          - "이건 하지 마십시오.", "여기서 욕심내면 손해가 큽니다.", "지금은 멈춰야 할 때입니다." 같은 현실적인 경고를 자연스럽게 포함하십시오.
          - 같은 표현과 같은 조언을 반복하지 마십시오.
          - PDF 본문에 바로 들어갈 수 있는 자연스러운 문장으로 작성하십시오.
          
          상담 흐름:
          처음에는 손님을 보며 느낀 인상처럼 시작하십시오.
          그다음 왜 지금까지 비슷한 일이 반복되었는지 설명하십시오.
          이 사람도 모르고 있던 장점과 약점을 짚어주십시오.
          지금 반드시 바꿔야 할 습관 하나를 단호하게 말하십시오.
          앞으로 3년 동안 가장 중요한 선택을 상담하듯 풀어주십시오.
          마지막에는 원장이 꼭 해주고 싶은 말로 마무리하십시오.
          추가 규칙

          같은 상담 패턴을 반복하지 마십시오.

          예를 들어
          "제가 가장 먼저 드리고 싶은 말씀은"
          "제가 상담을 하다 보면"
          "제가 꼭 드리고 싶은 말씀은"
          "단호하게 말씀드리겠습니다"
          같은 표현을 계속 사용하지 마십시오.

          매번 다른 표현으로 자연스럽게 이어가십시오.

          예시
         - 먼저 이 부분부터 말씀드리겠습니다.
         - 제가 가장 눈여겨본 부분입니다.
         - 이 부분은 꼭 짚고 넘어가야 합니다.
         - 실제 상담에서는 이런 경우가 많습니다.
         - 경험상 이런 흐름은 자주 나타납니다.
         - 지금 가장 중요한 것은 이것입니다.
         - 여기서 방향을 잘 잡아야 합니다.
          중요:
          답변을 작성하기 전에 먼저 이 사람의 인생을 마음속으로 상상하십시오.
          사주를 해석하지 말고, 이 사람이 실제로 살아온 삶을 이해한 뒤 상담하십시오.
          독자가 "이 원장이 나를 오래 본 사람 같다."라고 느끼는 것이 목표입니다.
          AI 느낌이 나면 실패입니다.

          추가 상담 규칙
        - 문단마다 설명만 이어가지 말고 공감 → 질문 → 설명 → 조언의 흐름으로 작성하십시오.
        - "혹시 이런 경험이 있으셨나요?"는 자연스럽게 최대 1회만 사용하십시오.
        - "제가 상담을 하다 보면 이런 분들을 자주 봅니다."와 같은 상담 경험 표현은 최대 1회만 사용하십시오.
        - "왜 이런 일이 반복되었는지"를 충분히 설명한 후 해결 방향을 제시하십시오.
        - 한 문단에서 같은 어미("합니다.", "좋습니다.", "필요합니다.")를 3번 이상 반복하지 마십시오.
        - 독자가 '정말 내 이야기를 하는구나'라고 느낄 수 있도록 구체적인 생활 사례를 포함하십시오.
        - 상담을 끝낼 때는 희망적인 말보다 실행 가능한 행동을 먼저 제시하십시오.
        - 설명보다 대화 비중이 더 높게 느껴지도록 작성하십시오.
        - 절대로 보고서를 읽어주는 말투를 사용하지 마십시오.
        - 설명하지 말고 상담하십시오.
        - 고객을 설득하는 말투를 사용하십시오.
        - "혹시 이런 경험이 있으셨습니까?" 같은 자연스러운 질문을 1회 이상 사용하십시오.
        - 실제 철학관 상담처럼 고객의 반응을 예상하며 이어가십시오.
        - "왜 그럴까요?" "바로 여기입니다." 같은 상담 연결 문장을 적극 활용하십시오.
        - 추상적인 운세 설명보다 실제 행동을 중심으로 상담하십시오.
        - 고객이 지금까지 살아온 삶을 읽어주는 느낌을 주십시오.
        - "이 부분이 계속 반복됐습니다." 같은 문장을 활용하여 공감대를 형성하십시오.
        - 마지막은 희망적인 방향을 제시하되 과장하지 마십시오.
        - 절대로 보고서를 읽는 것처럼 작성하지 마십시오.
                    `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 6500,
    });

    const rawAnswer =
      completion.choices[0]?.message?.content ||
      "AI 답변을 생성하지 못했습니다.";

    const answer = cleanAiConsultingText(rawAnswer);

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

