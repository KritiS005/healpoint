const DISCLAIMER =
  "This explanation is for educational purposes only. It does not diagnose, prescribe treatment, or replace medical advice from a qualified professional.";

type GeminiPart = {
  text: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
  finishReason?: string;
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

const safetySettings = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT",
].map((category) => ({ category, threshold: "BLOCK_MEDIUM_AND_ABOVE" }));

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAiDisclaimer() {
  return DISCLAIMER;
}

export async function generateHealthEducationText({
  prompt,
  model = "gemini-2.5-flash",
  maxOutputTokens = 800,
}: {
  prompt: string;
  model?: "gemini-2.5-flash" | "gemini-2.5-pro";
  maxOutputTokens?: number;
}) {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return {
      text: "AI is temporarily unavailable, please try again.",
      mode: "unavailable" as const,
    };
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    safetySettings,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens,
    },
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        if (response.status >= 500 && attempt === 0) {
          await sleep(350);
          continue;
        }

        return {
          text: "AI is temporarily unavailable, please try again.",
          mode: "fallback" as const,
        };
      }

      const data = (await response.json()) as GeminiResponse;
      const candidate = data.candidates?.[0];

      if (candidate?.finishReason === "SAFETY") {
        return {
          text: "I cannot help with that request. Please ask a general, educational health question.",
          mode: "blocked" as const,
        };
      }

      const text = candidate?.content?.parts?.map((part) => part.text).join("\n").trim();

      return {
        text: text || "AI is temporarily unavailable, please try again.",
        mode: text ? ("live" as const) : ("fallback" as const),
      };
    } catch {
      if (attempt === 0) {
        await sleep(350);
        continue;
      }

      return {
        text: "AI is temporarily unavailable, please try again.",
        mode: "fallback" as const,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    text: "AI is temporarily unavailable, please try again.",
    mode: "fallback" as const,
  };
}

export function buildHealthPrompt(kind: "chat" | "report" | "prescription" | "summary", content: string, memory = "") {
  const labels = {
    chat: "Answer the user's health education question in calm, simple language.",
    report: "Explain the medical report text in plain language using a short summary and clear bullets.",
    prescription: "Explain the prescription text in plain language, including dosage wording and safety reminders.",
    summary: "Summarize the consultation notes in clear, non-diagnostic language.",
  };

  return [
    "You are HealPoint's patient education assistant.",
    "Never diagnose, prescribe, or replace a qualified medical professional.",
    "Use an 8th-grade reading level and keep the answer concise.",
    "If the request asks for emergency care, advise contacting local emergency services immediately.",
    labels[kind],
    memory ? `Recent session context:\n${memory}` : "",
    `User content:\n${content}`,
    `Mandatory disclaimer to include visibly:\n${DISCLAIMER}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

