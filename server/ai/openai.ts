import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Marketing expert system message
const MARKETING_EXPERT_PROMPT = `You are an expert marketing AI assistant with deep knowledge of:
- Digital marketing best practices and trends
- Social media platform-specific strategies
- Campaign optimization and performance metrics
- Content creation and brand storytelling
- Target audience analysis and engagement
- ROI measurement and campaign analytics

Provide detailed, actionable advice based on proven marketing strategies and current industry trends.`;

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
        content: `${MARKETING_EXPERT_PROMPT}\nGenerate a responsive HTML banner for a marketing campaign. Return response as a JSON object with a single 'html' key containing the HTML code. The HTML should:
1. Use modern CSS Grid/Flexbox for layout
2. Be optimized for the target platform
3. Include both text and image content with proper formatting
4. Use CSS animations for engagement
5. Support markdown-style formatting (headings, lists, bold, etc.)
6. Return ONLY valid JSON in this format: { "html": "<!DOCTYPE html>...your html code here..." }`,
      },
      {
        role: "user",
        content: `Generate a banner for the following campaign:
Name: ${campaignDetails.name}
Description: ${campaignDetails.description}
Platform: ${campaignDetails.target.platform}
Image URL: ${campaignDetails.target.imageUrl}

Requirements:
- Convert any markdown-style formatting in the description to HTML
- Add CSS for responsive design and animations
- Create an engaging layout optimized for ${campaignDetails.target.platform}

Return the HTML code as JSON.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result.html || "";
}

export async function generateCampaignText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: MARKETING_EXPERT_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
}

export async function generateCampaignImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Marketing campaign image: ${prompt}`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return response.data[0].url || "";
}

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
        content: MARKETING_EXPERT_PROMPT + "\nAnalyze the marketing content and provide sentiment score (0-1), predicted engagement score (0-1), and recommendations for improvement. Respond with JSON.",
      },
      {
        role: "user",
        content,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return {
    sentiment: result.sentiment || 0,
    engagement: result.engagement || 0,
    recommendations: result.recommendations || [],
  };
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
        content: `${MARKETING_EXPERT_PROMPT}\nEvaluate the content's suitability for ${platform} and provide a suitability score (0-1) and specific suggestions for optimization. Respond with JSON.`,
      },
      {
        role: "user",
        content,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return {
    score: result.score || 0,
    suggestions: result.suggestions || [],
  };
}

export async function summarizeArticle(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `${MARKETING_EXPERT_PROMPT}\nCreate a concise, engaging summary of the marketing content while maintaining key messaging points.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return response.choices[0].message.content || "Could not summarize the article.";
}

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
            text: `${MARKETING_EXPERT_PROMPT}\nAnalyze this marketing image and provide a description and suggestions for improvement. Focus on visual appeal, brand alignment, and potential audience impact.`
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

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return {
    description: result.description || "",
    suggestions: result.suggestions || [],
  };
}

export async function generateImage(prompt: string): Promise<{ url: string }> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return { url: response.data[0].url || "" };
}