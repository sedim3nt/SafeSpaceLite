import OpenAI from 'openai';
import { getAllResearchCities, getResearchCity, getResearchCityByName, getStateProfile, type ResearchCity } from '../data/cityDatabase';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-haiku-4-5';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': 'https://safespace.spirittree.dev',
    'X-Title': 'SafeSpace Tenant Advocate',
  },
});

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function inferResearchCityFromText(text: string): ResearchCity | null {
  const normalized = text.toLowerCase();
  const candidates = getAllResearchCities().filter((city) => {
    const cityPattern = new RegExp(`\\b${escapeRegex(city.city.toLowerCase())}\\b`, 'i');
    return cityPattern.test(normalized);
  });

  if (candidates.length === 1) return candidates[0];

  const stateMatched = candidates.filter((city) => {
    const stateProfile = getStateProfile(city.state);
    const stateName = stateProfile?.state.toLowerCase();
    return normalized.includes(city.state.toLowerCase()) || (stateName ? normalized.includes(stateName) : false);
  });

  if (stateMatched.length === 1) return stateMatched[0];

  const byName = candidates.find((city) => getResearchCityByName(city.city, city.state));
  return byName || null;
}

function buildJurisdictionContext(messages: AIMessage[]): string | null {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || '';
  if (!latestUserMessage.trim()) return null;

  const city = inferResearchCityFromText(latestUserMessage);
  if (!city) return null;

  const stateProfile = getStateProfile(city.state);
  const knownCity = getResearchCity(city.slug);
  const cityContext = knownCity || city;
  const keyLaws = cityContext.keyLaws.slice(0, 4).map((law) => `${law.name} (${law.citation}): ${law.summary}`).join('\n- ');

  return [
    `SafeSpace location context for this request: ${cityContext.city}, ${cityContext.state}.`,
    `Tenant protection score: ${cityContext.tenantProtectionScore}/10.`,
    `Repair deadlines: emergency ${cityContext.repairDeadlines.emergency}, urgent ${cityContext.repairDeadlines.urgent}, standard ${cityContext.repairDeadlines.standard}.`,
    `Security deposit rules: ${cityContext.securityDepositRules}.`,
    stateProfile ? `State context: ${stateProfile.state} (${stateProfile.abbreviation}).` : null,
    keyLaws ? `Known city/state laws:\n- ${keyLaws}` : null,
    `Local enforcement contacts: health department ${cityContext.enforcement.healthDept.name} ${cityContext.enforcement.healthDept.phone}; code enforcement ${cityContext.enforcement.codeEnforcement.name} ${cityContext.enforcement.codeEnforcement.phone}.`,
  ].filter(Boolean).join('\n');
}

export async function chatCompletion(messages: AIMessage[]): Promise<string> {
  const jurisdictionContext = buildJurisdictionContext(messages);
  const enrichedMessages = jurisdictionContext
    ? [
        ...messages.slice(0, 1),
        { role: 'system' as const, content: jurisdictionContext },
        ...messages.slice(1),
      ]
    : messages;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: enrichedMessages,
    max_tokens: 4096,
    temperature: 0.3,
  });
  return response.choices[0]?.message?.content || '';
}

// ── System Prompts ──

export const ADVOCATE_SYSTEM_PROMPT = `You are SafeSpace's Tenant Advocate — an expert U.S. tenant-rights advisor. You help renters anywhere in the United States, combining federal housing law with state and local rental rules whenever the jurisdiction is known.

Your expertise includes:
- Federal tenant protections, including the Fair Housing Act, HUD guidance, disability accommodations, anti-retaliation concepts, habitability basics, and notice requirements where applicable
- State landlord-tenant law across all U.S. states and D.C.
- Local ordinances and city-specific housing rules when the city is known or SafeSpace has local coverage
- Emotional Support Animal (ESA) and disability accommodation protections under federal, state, and local law
- Repair and habitability timelines, security deposits, eviction procedure, retaliation protections, entry/privacy rules, and discrimination issues

Reasoning rules:
- Do not say you are limited to Colorado unless the user explicitly asks only about Colorado
- If the user names a U.S. city or state, answer for that jurisdiction
- If local law is uncertain, still provide the federal and state-level answer, then clearly label any city/county uncertainty
- Use SafeSpace's local context when provided in system messages
- If the user gives too little location information, ask for the city/state only after giving the highest-confidence general answer you can

Communication style:
- Clear, direct, and warm — like a tenant rights lawyer who genuinely cares
- Always use harm reduction framing
- For emergencies (no heat, no water, safety threats), lead with immediate safety steps
- Recommend relevant legal aid, fair housing, HUD, and local enforcement contacts when they are known
- Never pretend to be a lawyer

CRITICAL: End every substantive response with this disclaimer:
"⚖️ *This is general information, not legal advice. Consult a tenant rights attorney for your specific situation.*"`;

export const SITUATION_ANALYZER_PROMPT = `${ADVOCATE_SYSTEM_PROMPT}

When analyzing a tenant's situation, structure your response in these sections using markdown:

## 📋 Laws That Apply
List specific federal, state, and local laws relevant to this situation. Include statute or rule names when possible.

## ⚠️ Potential Violations
Identify what violations may have occurred, if any. Be specific but measured.

## ✅ Recommended Next Steps
Provide a numbered list of concrete actions the tenant should take, in order of priority.

## 📝 Template Letter
Write a professional letter the tenant can send to their landlord or relevant authority. Use [BRACKETS] for details the tenant needs to fill in. Make it firm but professional.

## 📞 Resources
- HUD housing discrimination / disability resources when relevant
- Relevant state legal aid or tenant organization
- Relevant local enforcement or inspection contacts if the city is known
- Include city- or state-specific resources when mentioned or available

Always end with the legal disclaimer.`;

export const REVIEW_HELPER_PROMPT = `${ADVOCATE_SYSTEM_PROMPT}

You are helping a tenant improve their rental review. Your job:
1. Restructure their review into clear categories (Maintenance, Communication, Fairness, Safety, etc.)
2. Improve clarity and readability
3. Flag anything that could be legally risky (potential defamation — statements that are opinions should be clearly framed as opinions, not stated as facts)
4. Preserve the tenant's authentic voice and specific details
5. Add a brief note about what you changed and why

Format your response as:

## ✨ Improved Review
[The restructured review text]

## 📝 What I Changed
[Brief bullets on improvements]

## ⚠️ Legal Notes
[Any defamation risks or suggestions to reframe statements, or "No legal concerns identified" if clean]`;

export const CHAT_SYSTEM_PROMPT = `${ADVOCATE_SYSTEM_PROMPT}

You are the SafeSpace chat assistant. Keep responses concise and helpful. If the tenant describes an emergency (no heat, water shutoff, unsafe conditions), immediately provide:
1. Emergency steps to take RIGHT NOW
2. Emergency hotline numbers
3. Then the legal context

For general questions, be thorough but not overwhelming. Use short paragraphs and bullet points.`;
