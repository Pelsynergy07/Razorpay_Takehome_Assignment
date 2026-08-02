/**
 * OpenRouter AI Integration for MyRA Assistant
 *
 * Tiered Model Fallback Chain:
 * 1. Primary Model:   google/gemma-4-26b-a4b-it:free
 * 2. Secondary Model: inclusionai/ling-3.0-flash:free
 * 3. Offline Engine:  Smart Regex & Intent Matcher
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const CANDIDATE_MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'inclusionai/ling-3.0-flash:free',
];

export const isOpenRouterConfigured = Boolean(
  OPENROUTER_API_KEY &&
  !OPENROUTER_API_KEY.includes('YOUR_OPENROUTER_KEY')
);

const SYSTEM_PROMPT = `You are MyRA, MakeMyTrip's intelligent AI travel assistant.
This interactive prototype is specifically designed to demonstrate MakeMyTrip's AI-Powered Group Trip Planning Experience.

STRICT BEHAVIORAL RULES:
1. OFF-TOPIC / IRRELEVANT PROMPTS:
If the user asks something unrelated to travel or group trip planning (e.g. coding, math, general trivia):
Politely respond: "Welcome! 👋 This interactive prototype is tailored specifically to showcase MakeMyTrip's AI Group Travel Planning experience. To test the prototype, try sending a message about planning a trip with your friends (e.g., 'I want to plan a weekend getaway to Goa with my friends')."
Do NOT include [AWAITING_CONFIRMATION] or [LAUNCH_SYNC_MODE].

2. GROUP TRIP INTENT EXPRESSED (Step 1):
If the user mentions wanting to plan a trip, getaway, vacation, or travel with friends/group/family:
Acknowledge their trip idea warmly in elegant English, and ask: "Group trips are fantastic, but coordinating budgets, dates, and preferences across everyone can be tricky! Would you like to enable **Group Sync Mode** so your friends can easily share their preferences via a quick 2-minute share link?"
Append the exact token "[AWAITING_CONFIRMATION]" at the end of your response. Do NOT append [LAUNCH_SYNC_MODE] yet!

3. USER CONFIRMS (Step 2 - User says "yes", "sure", "yeah", "let's do it", "sounds good", "okay"):
If the user is confirming to try Group Sync Mode:
Respond enthusiastically: "Awesome! Let's set up your group trip session..." and append the exact token "[LAUNCH_SYNC_MODE]" at the end of your response so the UI can attach the Group Sync button.`;

async function callOpenRouterModel(modelName, formattedMessages) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'MakeMyTrip MyRA AI Assistant',
    },
    body: JSON.stringify({
      model: modelName,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter Error (${modelName}): ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response content from ${modelName}`);

  return content;
}

export async function generateMyraAIResponse(userMessage, chatHistory = []) {
  if (!isOpenRouterConfigured) {
    return null; // Fall back to smart offline response engine
  }

  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory.slice(-4).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  // Try candidate models in order
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const content = await callOpenRouterModel(modelName, formattedMessages);
      const hasLaunchIntent = content.includes('[LAUNCH_SYNC_MODE]');
      const isAwaitingConfirmation = content.includes('[AWAITING_CONFIRMATION]');
      const cleanText = content
        .replace('[LAUNCH_SYNC_MODE]', '')
        .replace('[AWAITING_CONFIRMATION]', '')
        .trim();

      return {
        text: cleanText,
        hasLaunchIntent,
        isAwaitingConfirmation,
        modelUsed: modelName,
      };
    } catch (err) {
      console.warn(`[OpenRouter Model Failed: ${modelName}]`, err.message);
    }
  }

  console.warn('[OpenRouter] All candidate models failed. Falling back to offline engine.');
  return null; // Fallback to smart offline engine
}
