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
  businessName,
  category,
  businessScale,
  businessType,
  serviceHighlight,
  rating = 5,  
  experience,
  keywords = [],
  tone,
  length,
  location,
  language,
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
  // Optimized: Run DB queries concurrently to reduce latency
  let groundingConfig, businessObj;
  let pastDbReviews = [];
  if (businessId) {
    [groundingConfig, businessObj, pastDbReviews] = await Promise.all([
      db.getAiGroundingConfig(businessId),
      db.getBusinessById(businessId),
      db.getReviews(businessId, branchId)
    ]);
  }

  // Deduplication list: Combine past DB reviews for this business with any explicitly provided previous reviews
  const existingReviewTexts = [
    ...pastDbReviews.map(r => r.reviewText),
    ...previousReviews
  ].filter(Boolean);

  const previous_10_reviews_list = existingReviewTexts.slice(-10).map((r, i) => `${i + 1}. "${r}"`).join("\n") || "None";

  // Dynamic context resolution from ai_grounding_configs table & business table
  const targetBizName = businessName || businessObj?.name;
  const targetCategory = category || businessObj?.category;
  const targetScale = groundingConfig?.teamSize || businessScale;
  const targetLocationSetup = groundingConfig?.locationSetup || location;
  const targetAge = groundingConfig?.businessAge;
  const targetAudience = groundingConfig?.targetAudience;
  const targetTone = groundingConfig?.toneEnthusiasm || tone;
  const highlightStr = serviceHighlight || (keywords && keywords.length > 0 ? keywords.join(", ") : undefined);

  let businessContextLines = [];
  if (targetBizName) businessContextLines.push(`- Name: ${targetBizName}`);
  if (targetCategory) businessContextLines.push(`- Category & Industry: ${targetCategory}`);
  if (targetScale) businessContextLines.push(`- Team Size & Scale: ${targetScale}`);
  if (targetLocationSetup) businessContextLines.push(`- Location Setup: ${targetLocationSetup}`);
  if (targetAge) businessContextLines.push(`- Business Established: ${targetAge}`);
  if (targetAudience) businessContextLines.push(`- Target Audience: ${targetAudience}`);
  if (targetTone) businessContextLines.push(`- Tone & Enthusiasm: ${targetTone}`);
  if (highlightStr) businessContextLines.push(`- Key Highlights / Service Tags: ${highlightStr}`);
  businessContextLines.push(`- Target Language: ${language || 'English'}`);

  const businessContextSection = businessContextLines.length > 0 
    ? `BUSINESS CONTEXT & ANTI-HYPERBOLE GROUNDING:\n${businessContextLines.join("\n")}\n` 
    : "";

  const systemInstruction = `You are ReviewScore AI, a system designed to generate natural, authentic Google Maps reviews for businesses based on accurate context.

${businessContextSection}
STRICT WRITING RULES:
1. MATCH SCALE TO REALITY: Ground review in actual scale${targetScale ? ` (${targetScale})` : ''}. Never over-exaggerate. Sound like a realistic satisfied client${targetCategory ? ` of a ${targetCategory} business` : ''}. Do NOT use grand hyperbole like "dream come true," "life-changing," "best in the world," or "miracle worker."
2. NO HYPERBOLE: Express satisfaction through realistic outcomes (e.g., "got good leads," "great communication," "timely response," "good guidance," "clean facility")${targetTone ? ` matching a ${targetTone} tone` : ''}.
3. NO EM-DASHES: Do not use "—" under any circumstances.
4. LENGTH: Keep reviews to around 150 characters or 2 lines maximum, natural-sounding sentences.
5. BUSINESS-SPECIFIC DEDUPLICATION: Review the array of PREVIOUS_REVIEWS for this business. You MUST use completely different sentence structures, vocabulary, tone, and focal points than those listed.
6. LOCAL SEO OPTIMIZED: Naturally incorporate the provided keywords, specific services, or products. Mention the location or city if applicable to boost local search rankings. Make it sound completely organic and conversational (avoid keyword stuffing).
7. HIGHLY HUMAN & CASUAL: Write exactly like a real person quickly typing a review on their mobile phone in first-person ("I", "my"). Do NOT use predictable AI templates or cliches (like "highly recommended", "overall a great experience", "was impressed by", "process felt smooth"). Be brief, enthusiastic, and slightly imperfect.
8. NO HALLUCINATION: Do NOT invent, assume, or hallucinate any details (like specific names, services, or locations) that are not explicitly provided in the context. If an input is missing, write naturally without it.


LANGUAGE GUIDELINES:
- If language is "English": Write in highly casual, conversational English using first-person perspective. Avoid robotic structures. Use natural phrasing (e.g., "Love my new pieces!", "Super fast and helpful!"). It must sound like a quick, genuine comment left on a phone.
- If language is "Hinglish" or "Roman Hindi": Write EXACTLY how a real Indian user types casually on WhatsApp or their phone. Do NOT use overly structured, robotic, or generic phrases (e.g., avoid "overall accha experience raha" or "bilkul dard nahi hua"). Use natural, everyday Hinglish with casual spelling (like 'bht' instead of 'bahut', 'achi' instead of 'achhi', 'thk' instead of 'theek'). The review must feel 100% human, raw, and relatable. Do not use formal Devanagari Hindi or translated phrases.

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
            content: `Generate review for ${targetBizName || 'the business'}. Customer experience context: ${experience || 'Positive experience'}. Rating: ${rating}/5.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
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

  console.log(`\n✅ SUCCESS: AI Review generated dynamically for Business "${targetBizName || 'Unknown'}" (${businessId || 'N/A'})`);
  console.log(`Grounding parameters applied: Scale=${targetScale || 'N/A'}, Setup=${targetLocationSetup || 'N/A'}, Tone=${targetTone || 'N/A'}`);
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