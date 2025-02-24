import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Campaign content generation helpers
export async function generateCampaignText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an AI marketing expert. Create compelling marketing copy based on the provided prompt. Focus on being engaging, persuasive, and platform-appropriate.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || "";
}

export async function generateCampaignImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Marketing campaign image: ${prompt}`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return response.data[0].url;
}

export async function generateLandingPage(campaignDetails: {
  name: string;
  description: string;
  target: Record<string, any>;
}): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Generate an HTML landing page template for a marketing campaign. Include modern styling and responsive design.",
      },
      {
        role: "user",
        content: JSON.stringify(campaignDetails),
      },
    ],
    response_format: { type: "json_object" },
  });

  const template = JSON.parse(response.choices[0].message.content);
  return template.html || "";
}

// Content analysis helpers
export async function analyzeContent(content: string): Promise<{
  sentiment: number;
  engagement: number;
  recommendations: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Analyze the marketing content and provide sentiment score (0-1), predicted engagement score (0-1), and recommendations for improvement. Respond with JSON.",
      },
      {
        role: "user",
        content,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function getPlatformRecommendations(content: string, platform: string): Promise<{
  score: number;
  suggestions: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Evaluate the content's suitability for ${platform} and provide a suitability score (0-1) and specific suggestions for optimization. Respond with JSON.`,
      },
      {
        role: "user",
        content,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

// Helper function for summarizing content
export async function summarizeArticle(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Create a concise, engaging summary of the marketing content while maintaining key messaging points.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return response.choices[0].message.content || "";
}

// Helper function for analyzing images
export async function analyzeImage(base64Image: string): Promise<{
  description: string;
  suggestions: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this marketing image and provide a description and suggestions for improvement. Focus on visual appeal, brand alignment, and potential audience impact."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

// Helper function for generating images
export async function generateImage(prompt: string): Promise<{ url: string }> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return { url: response.data[0].url };
}
