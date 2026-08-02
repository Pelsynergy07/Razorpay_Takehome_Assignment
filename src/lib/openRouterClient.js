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
Your goal is to help users plan trips, find deals, and organize group travel seamlessly.
Keep your responses warm, concise, helpful, and formatted in clean markdown.
If the user mentions planning a trip, vacation, getaway, or traveling with friends/group/family:
1. Warmly acknowledge their destination or idea.
2. Proactively invite them to set up a Group Sync session so everyone can contribute asynchronously.
3. Include the exact text "[LAUNCH_SYNC_MODE]" at the end of your response when trip planning intent is detected so the UI can attach the Group Sync button.`;

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
      const cleanText = content.replace('[LAUNCH_SYNC_MODE]', '').trim();

      return {
        text: cleanText,
        hasLaunchIntent,
        modelUsed: modelName,
      };
    } catch (err) {
      console.warn(`[OpenRouter Model Failed: ${modelName}]`, err.message);
    }
  }

  console.warn('[OpenRouter] All candidate models failed. Falling back to offline engine.');
  return null; // Fallback to smart offline engine
}
