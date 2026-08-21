import { db } from '../database/store';

export interface AiGenerationResult {
  reviewText: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export async function generateGoogleReview({
  businessId,
  branchId,
  businessName = "",
  category = "",
  businessScale = "Solo",
  businessType = "Local Business",
  serviceHighlight = "",
  rating = 5,
  experience = "",
  keywords = [],
  tone = "Subtle & Professional",
  length = "medium",
  location = "",
  language = "English",
  previousReviews = [] as string[],
}: {
  businessId?: string;
  branchId?: string;
  businessName?: string;
  category?: string;
  businessScale?: string;
  businessType?: string;
  serviceHighlight?: string;
  rating?: number;
  experience?: string;
  keywords?: string[];
  tone?: string;
  length?: string;
  language?:string;
  location?: string;
  previousReviews?: string[];
}) {
  // 1. Dynamic Database Lookup: Fetch business profile, AI grounding config & past reviews for this specific business
  let groundingConfig = businessId ? await db.getAiGroundingConfig(businessId) : undefined;
  let businessObj = businessId ? await db.getBusinessById(businessId) : undefined;
  let pastDbReviews = businessId ? await db.getReviews(businessId, branchId) : [];

  // Deduplication list: Combine past DB reviews for this business with any explicitly provided previous reviews
  const existingReviewTexts = [
    ...pastDbReviews.map(r => r.reviewText),
    ...previousReviews
  ].filter(Boolean);

  const previous_10_reviews_list = existingReviewTexts.slice(-10).map((r, i) => `${i + 1}. "${r}"`).join("\n") || "None";

  // Dynamic context resolution from ai_grounding_configs table & business table
  const targetBizName = businessName || businessObj?.name || 'Business';
  const targetCategory = category || businessObj?.category || 'General Service';
  const targetScale = groundingConfig?.teamSize || businessScale || 'Solo / Freelancer (1)';
  const targetLocationSetup = groundingConfig?.locationSetup || location || 'Physical Store / Office (In-person)';
  const targetAge = groundingConfig?.businessAge || '1 - 3 Years';
  const targetAudience = groundingConfig?.targetAudience || 'B2B';
  const targetTone = groundingConfig?.toneEnthusiasm || tone || 'Subtle & Professional';

  const highlightStr = serviceHighlight || keywords.join(", ") || "Great service and smooth communication";

  const systemInstruction = `You are ReviewScore AI, a system designed to generate natural, authentic Google Maps reviews for businesses based on accurate context.

BUSINESS CONTEXT & ANTI-HYPERBOLE GROUNDING (Fetched from ai_grounding_configs DB):
- Name: ${targetBizName}
- Category & Industry: ${targetCategory}
- Team Size & Scale: ${targetScale}
- Location Setup: ${targetLocationSetup}
- Business Established: ${targetAge}
- Target Audience: ${targetAudience}
- Tone & Enthusiasm: ${targetTone}
- Key Highlights / Service Tags: ${highlightStr}
- Target Language: ${language}

STRICT WRITING RULES:
1. MATCH SCALE TO REALITY: Ground review in actual scale (${targetScale}). Never over-exaggerate. Sound like a realistic satisfied client of a ${targetCategory} business. Do NOT use grand hyperbole like "dream come true," "life-changing," "best in the world," or "miracle worker."
2. NO HYPERBOLE: Express satisfaction through realistic outcomes (e.g., "got good leads," "great communication," "timely response," "good guidance," "clean facility") matching a ${targetTone} tone.
3. NO EM-DASHES: Do not use "—" under any circumstances.
4. LENGTH: Keep reviews to exactly 2 to 3 concise, natural-sounding sentences.
5. BUSINESS-SPECIFIC DEDUPLICATION: Review the array of PREVIOUS_REVIEWS for this business. You MUST use completely different sentence structures, vocabulary, tone, and focal points than those listed.

LANGUAGE GUIDELINES:
- If language is "English": Use natural conversational English with mild variation.
- If language is "Hinglish" or "Roman Hindi": Write in authentic Hinglish as typed by real Indian users (e.g., "Inki ${targetCategory} service kafi achhi hai. Response time fast hai aur work quality professional hai."). Do not use formal Devanagari Hindi or translated robotic phrases.

PREVIOUS_REVIEWS TO AVOID (Specific to Business ID: ${businessId || 'N/A'}):
${previous_10_reviews_list}

Generate ONE unique review now.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:7869",
        "X-OpenRouter-Title": "Google Review Generator",
      },
      body: JSON.stringify({
        model: `${process.env.OPENROUTER_API_MODEL || 'google/gemini-2.5-flash-lite'}`,
        messages: [
          {
            role: "system",
            content: systemInstruction,
          },
          {
            role: "user",
            content: `Generate review for ${targetBizName}. Customer experience context: ${experience || 'Positive experience'}. Rating: ${rating}/5.`,
          },
        ],
        temperature: 0.6,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${error}`);
  }

  const data = await response.json();
  const generatedReviewText = data.choices?.[0]?.message?.content?.trim() || "";
  const usage = data.usage || {};
  const modelName = process.env.OPENROUTER_API_MODEL || 'google/gemini-2.5-flash-lite';
  const promptTokens = usage.prompt_tokens || Math.ceil(systemInstruction.length / 4);
  const completionTokens = usage.completion_tokens || Math.ceil(generatedReviewText.length / 4);
  const totalTokens = usage.total_tokens || (promptTokens + completionTokens);

  console.log(`\n✅ SUCCESS: AI Review generated dynamically for Business "${targetBizName}" (${businessId || 'N/A'})`);
  console.log(`Grounding parameters applied: Scale=${targetScale}, Setup=${targetLocationSetup}, Tone=${targetTone}`);
  console.log(`Model Used: ${modelName}`);
  console.log(`Tokens Used: Total=${totalTokens} (Prompt=${promptTokens}, Completion=${completionTokens})`);
  console.log(`Preview: "${generatedReviewText.substring(0, 60)}..."\n`);

  return {
    reviewText: generatedReviewText,
    provider: 'OpenRouter',
    model: modelName,
    promptTokens,
    completionTokens,
    totalTokens,
  };
}
