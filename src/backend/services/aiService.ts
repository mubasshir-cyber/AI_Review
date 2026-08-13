
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
  businessName,
  category = "",
  rating,
  experience,
  keywords = [],
  tone = "natural and friendly",
  length = "medium",
  location = "",
  language = "English",
}) {
  const prompt = `
Generate a natural-sounding Google review for the following business.

Business name: ${businessName}
Business type / Industry: ${category || "Not specified"}
Location: ${location || "Not specified"}
Rating: ${rating}/5
Customer experience: ${experience}
Things to mention: ${keywords.join(", ") || "None"}
Tone: ${tone}
Length: ${length}
Language: ${language}

Requirements:
- Review should be 5 stars if rating is 5 stars and 1 star if rating is 1 star.
- Review should be SEO Optimized, and AEO optimized
- Review should be under 40 words, but one out of five reviews should be 50-70 words.
- Write the review as if it were written by a real customer.
- Do not sound like an advertisement.
- Do not invent specific facts that were not provided.
- Mention the business name naturally, but don't repeat it unnecessarily.
- Match the sentiment to the rating.
- Avoid excessive marketing language.
- Do not use hashtags.
- Return ONLY the review text.
`;

  const response = await fetch( "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:7869",
        "X-OpenRouter-Title": "Google Review Generator",
      },
      body: JSON.stringify({
        model: `${process.env.OPENROUTER_API_MODEL}`,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
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
  const promptTokens = usage.prompt_tokens || Math.ceil(prompt.length / 4);
  const completionTokens = usage.completion_tokens || Math.ceil(generatedReviewText.length / 4);
  const totalTokens = usage.total_tokens || (promptTokens + completionTokens);

  console.log(`\n✅ SUCCESS: AI Review generated using OpenRouter!`);
  console.log(`Model Used: ${modelName}`);
  console.log(`Tokens Used: Total=${totalTokens} (Prompt=${promptTokens}, Completion=${completionTokens})`);
  console.log(`Preview: "${generatedReviewText.substring(0, 50)}..."\n`);

  return {
    reviewText: generatedReviewText,
    provider: 'OpenRouter',
    model: modelName,
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

