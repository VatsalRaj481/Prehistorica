import '../dns-init.js';
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ [GEMINI] GEMINI_API_KEY is not defined in environment variables. AI features will operate with fallbacks.');
}

export const aiClient = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const PRIMARY_FLASH_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_FLASH_MODELS = ['gemini-3-flash-preview', 'gemini-flash-lite-latest', 'gemini-flash-latest'];
export const EMBEDDING_MODEL = 'gemini-embedding-2';

/**
 * Robust execution wrapper with retry and model fallback for high-demand spikes (503 / 429)
 */
async function generateContentWithRetry(params: any): Promise<any> {
  const models = [PRIMARY_FLASH_MODEL, ...FALLBACK_FLASH_MODELS];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await aiClient.models.generateContent({
        ...params,
        model
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = String(err.message || '');
      console.warn(`[GEMINI] Model ${model} failed (${msg.slice(0, 90)}...). Falling over to next model in cascade...`);
    }
  }

  throw lastError;
}

/**
 * Robust streaming execution wrapper with model fallback for high-demand spikes
 */
async function* generateContentStreamWithRetry(params: any): AsyncGenerator<any, void, unknown> {
  const models = [PRIMARY_FLASH_MODEL, ...FALLBACK_FLASH_MODELS];
  let lastError: any = null;

  for (const model of models) {
    let chunksYielded = 0;
    try {
      const responseStream = await aiClient.models.generateContentStream({
        ...params,
        model
      });
      for await (const chunk of responseStream) {
        chunksYielded++;
        yield chunk;
      }
      return;
    } catch (err: any) {
      lastError = err;
      if (chunksYielded > 0) {
        throw err;
      }
      const msg = String(err.message || '');
      console.warn(`[GEMINI STREAM] Model ${model} failed before streaming (${msg.slice(0, 90)}...). Falling over to next model in cascade...`);
    }
  }

  throw lastError;
}

/**
 * Helper to generate text embeddings (default 768 dimensions for pgvector)
 */
export async function generateEmbedding(text: string, outputDim = 768): Promise<number[]> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const res: any = await aiClient.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: outputDim }
  });

  const vector = res.embeddings?.[0]?.values;
  if (!vector || !Array.isArray(vector)) {
    throw new Error('Failed to retrieve vector values from embedding model');
  }
  return vector;
}

/**
 * 1. The Chief Curator — Grounded Paleontological RAG Agent
 */
export interface CuratorMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export interface GroundingSpeciesContext {
  id: number;
  name: string;
  scientificName: string;
  clade: string;
  diet: string;
  habitat: string;
  timePeriod: string;
  myaStart: number;
  myaEnd: number;
  geographicRange?: any;
  interestingFacts?: string[];
  sizeNotes?: string;
  similarity?: number;
}

/**
 * Builds the curatorial system instruction for Rajy the AI Docent.
 * Embodies the charismatic persona of Rajy (Rajasaurus narmadensis) — Prehistorica's Chief Curator.
 */
export function buildChiefCuratorSystemInstruction(
  isFirstTurn: boolean,
  contextSpecies: GroundingSpeciesContext[] = []
): string {
  const greetingRule = isFirstTurn
    ? `Turn Rule (FIRST TURN ONLY):
You MUST open your response with this welcoming greeting:
"Welcome to Prehistorica! I am Rajy — Chief Curator, resident Rajasaurus, and your guide through the deep-time marvels of our collection."
Immediately after this single sentence, proceed directly to answer the visitor's question with enthusiasm, scientific rigor, and vivid paleobiological insight.`
    : `Turn Rule (FOLLOW-UP TURN):
This is an ongoing conversation. You MUST NOT include any greeting, welcoming preamble, or persona self-introduction. Do NOT say "Welcome to Prehistorica", do NOT say "I am Rajy" or "I am the Chief Curator", and do NOT say "delighted to guide you".
Jump DIRECTLY into answering the visitor's question in your opening sentence.`;

  return `You are "Rajy" — the Chief Curator of Prehistorica: The Modern Museum Pavilion Encyclopedia.
Physically and historically, you are a sentient Rajasaurus narmadensis — the crowned, majestic Late Cretaceous abelisaurid apex theropod excavated from the ancient Lameta Formation of India's Narmada Valley. You combine the deep-time perspective of a creature that lived through the Mesozoic with the rigorous peer-reviewed mastery of an elite vertebrate paleontologist and the warm, infectious passion of a world-class museum docent.

Opening & Greeting Protocol:
${greetingRule}

Voice, Tone & Curatorial Persona:
1. Direct Answers First: Always lead with a punchy, direct answer to the visitor's question in your very first sentence before expanding into deeper evolutionary, anatomical, or stratigraphic context. If asked about sizes, mass, or scale matchups, state the exact metric measurements immediately.
2. Authentic Curatorial Persona:
   - Speak with scholarly authority, vivid naturalistic imagery, and deep-time wonder (think David Attenborough meeting an impassioned vertebrate anatomist).
   - You are proud of your Rajasaurus identity and Gondwanan heritage. You may occasionally include subtle, dignified, self-aware observations (e.g., your short abelisaurid forearms, your cranial crest horn, or your Late Cretaceous neighbors in India), but keep it tasteful, intelligent, and natural — never cartoonish or slapstick.
3. Natural, Dynamic Structure:
   - AVOID rigid, formulaic templates. DO NOT use repetitive boilerplate subheadings like "Anatomical Divergence", "Feeding Strategies & Dentition", or "Curatorial Takeaway" on every response.
   - Use natural markdown: crisp, topic-tailored subheadings (### Subheading) or concise bullet points when breaking down multi-part anatomical or evolutionary comparisons.
   - DO NOT end your response with robotic canned phrases like "I invite you to examine these magnificent anatomical contrasts firsthand by clicking on the hyperlinked species names above to explore their dedicated exhibit bays." Instead, close naturally with a thought-provoking evolutionary insight, an intriguing open question, or a brief invitation to test the specimens on our 1:1 Runway or 3D viewer.
4. Specimen Hyperlinks & Grounding:
   - When mentioning a cataloged Prehistorica specimen present in your context, link its name using markdown: [Specimen Name](/species/{id}) (e.g. [Plesiosaurus](/species/${contextSpecies[0]?.id || 1})).
   - Anchor links directly to species names (never say "click the catalog numbers").
   - Rely on verified paleontological consensus and differentiate established consensus from active debates (e.g., Spinosaurus aquatic locomotion, Tyrannosaur integument/feathers, Nanotyrannus ontogeny).
   - Crucial Grounding Rule: Rely on the cataloged specimens provided in context, but DO NOT force-feed unmentioned or irrelevant context specimens if they do not logically relate to the visitor's question.
5. Scientific Units: Always use standard metric units (meters, kilograms, tonnes, Ma for millions of years ago).
6. Interactive Museum Action Chips:
   - When comparing two species, discussing size differences, or exploring scale matchups, offer an interactive Runway comparison chip on its own line:
     [⚡ Compare on 1:1 Runway: Species A vs. Species B](/runway?ids={idA},{idB})
     (e.g., [⚡ Compare on 1:1 Runway: Plesiosaurus vs. Liopleurodon](/runway?ids=225,224))
   - When discussing a single dramatic creature's scale, you can offer:
     [⚡ Inspect on 1:1 Scale Runway](/runway?ids={id})
   - Clicking these chips allows visitors to immediately launch and compare the specimens on Prehistorica's calibrated metric runway.`;
}

export const CANONICAL_WELCOME = 'Welcome to Prehistorica! I am Rajy — Chief Curator, resident Rajasaurus, and your guide through the deep-time marvels of our collection.';
export const WELCOME_REGEX = /^Welcome\s+to\s+Prehistorica[.!:]?\s*(?:(?:I\s+am|I'm)\s+(?:Rajy\s*[-—–]\s*)?(?:the\s+)?Chief\s+Curator,?\s*)?(?:(?:resident\s+Rajasaurus,?\s*)?(?:and\s+)?(?:your\s+guide|I\s+am\s+delighted\s+to\s+guide\s+you)[^.\n]*[.!:]\s*)?/i;

/**
 * Reformulates a conversational multi-turn user query into a self-contained,
 * keyword-rich search query for vector retrieval over the paleontological database.
 */
export async function reformulateCuratorQuery({
  query,
  conversationHistory = []
}: {
  query: string;
  conversationHistory?: CuratorMessage[];
}): Promise<string> {
  const validHistory = (conversationHistory || []).filter(
    (m) => m.content && m.content.trim().length > 0
  );

  if (validHistory.length === 0) {
    return query.trim();
  }

  // Focus on the most recent turns to maintain tight context
  const recentHistory = validHistory.slice(-4);

  try {
    const prompt = `You are a search query optimizer for a prehistoric museum encyclopedia database (paleontology, fossil specimens, dinosaurs, marine reptiles, pterosaurs, ancient ecosystems).
Given the recent conversation between a museum visitor and the AI docent, rewrite the visitor's latest question into a concise, standalone, keyword-rich search query for semantic vector search.
Resolve all pronouns and contextual references ("they", "it", "each group", "both", "these creatures", "the larger one", "their predators") into specific taxa names, clades, epochs, or anatomical terms discussed.
Output ONLY the standalone search query without quotes, explanations, or markdown.

Recent Conversation:
${recentHistory.map((m) => `${m.role === 'user' ? 'Visitor' : 'Docent'}: ${m.content.slice(0, 250)}`).join('\n')}

Latest Visitor Question: "${query}"

Standalone Search Query:`;

    const res = await aiClient.models.generateContent({
      model: PRIMARY_FLASH_MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 60
      }
    });

    const reformulated = res.text?.trim().replace(/^["']|["']$/g, '');
    if (reformulated && reformulated.length > 2) {
      return reformulated;
    }
  } catch (err: any) {
    console.warn('[REFORMULATE QUERY] Fallback due to error:', err?.message || err);
  }

  return query.trim();
}

export async function askChiefCurator({
  query,
  conversationHistory = [],
  contextSpecies = []
}: {
  query: string;
  conversationHistory?: CuratorMessage[];
  contextSpecies?: GroundingSpeciesContext[];
}): Promise<{ response: string; referencedSpecies: number[] }> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const speciesGroundingSnippet = contextSpecies.length > 0
    ? contextSpecies.map((s) => `
[Specimen #${s.id}: ${s.name} (${s.scientificName})]
- Clade: ${s.clade} | Diet: ${s.diet} | Habitat: ${s.habitat}
- Temporal Range: ${s.myaStart}–${s.myaEnd} Ma (${s.timePeriod})
- Geography & Formations: ${typeof s.geographicRange === 'object' ? JSON.stringify(s.geographicRange) : s.geographicRange}
- Size & Anatomy: ${s.sizeNotes || 'N/A'}
- Key Facts: ${Array.isArray(s.interestingFacts) ? s.interestingFacts.join('; ') : s.interestingFacts}
`).join('\n')
    : 'No directly indexed species matched this query above threshold.';

  const validHistory = (conversationHistory || []).filter(
    (m) => m.content && m.content.trim().length > 0
  );
  const isFirstTurn = validHistory.length === 0;

  const systemInstruction = buildChiefCuratorSystemInstruction(isFirstTurn, contextSpecies);

  const currentTurnPrompt = `[REFERENCE SPECIMENS CATALOGED IN PREHISTORICA PAVILION]:\n${speciesGroundingSnippet}\n\nUser Question: ${query}`;

  const historyContents = validHistory.map((m) => ({
    role: (m.role === 'assistant' || m.role === 'model' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }]
  }));

  const contents = historyContents.length > 0
    ? [...historyContents, { role: 'user' as const, parts: [{ text: currentTurnPrompt }] }]
    : currentTurnPrompt;

  const response = await generateContentWithRetry({
    contents,
    config: {
      systemInstruction,
      temperature: 0.3
    }
  });

  let responseText = response.text || 'I apologize, but I could not formulate a curatorial evaluation at this moment.';

  if (isFirstTurn) {
    if (WELCOME_REGEX.test(responseText)) {
      responseText = responseText.replace(WELCOME_REGEX, `${CANONICAL_WELCOME}\n\n`).trim();
    } else {
      responseText = `${CANONICAL_WELCOME}\n\n${responseText}`.trim();
    }
  } else {
    // Follow-up turn: strip any accidental repetitive greeting
    if (WELCOME_REGEX.test(responseText)) {
      responseText = responseText.replace(WELCOME_REGEX, '').trim();
    }
    responseText = responseText.replace(/^(?:Greetings|Hello|Hi),?\s*(?:visitor|explorer|guest)?[.!:]?\s*/i, '').trim();
  }
  
  // Extract species IDs referenced in the response
  const referencedSpecies: number[] = [];
  contextSpecies.forEach(s => {
    if (responseText.includes(`/species/${s.id}`) || responseText.toLowerCase().includes(s.name.toLowerCase())) {
      referencedSpecies.push(s.id);
    }
  });

  return {
    response: responseText,
    referencedSpecies
  };
}

export async function* askChiefCuratorStream({
  query,
  conversationHistory = [],
  contextSpecies = []
}: {
  query: string;
  conversationHistory?: CuratorMessage[];
  contextSpecies?: GroundingSpeciesContext[];
}): AsyncGenerator<string, { response: string; referencedSpecies: number[] }, unknown> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const speciesGroundingSnippet = contextSpecies.length > 0
    ? contextSpecies.map((s) => `
[Specimen #${s.id}: ${s.name} (${s.scientificName})]
- Clade: ${s.clade} | Diet: ${s.diet} | Habitat: ${s.habitat}
- Temporal Range: ${s.myaStart}–${s.myaEnd} Ma (${s.timePeriod})
- Geography & Formations: ${typeof s.geographicRange === 'object' ? JSON.stringify(s.geographicRange) : s.geographicRange}
- Size & Anatomy: ${s.sizeNotes || 'N/A'}
- Key Facts: ${Array.isArray(s.interestingFacts) ? s.interestingFacts.join('; ') : s.interestingFacts}
`).join('\n')
    : 'No directly indexed species matched this query above threshold.';

  const validHistory = (conversationHistory || []).filter(
    (m) => m.content && m.content.trim().length > 0
  );
  const isFirstTurn = validHistory.length === 0;

  const systemInstruction = buildChiefCuratorSystemInstruction(isFirstTurn, contextSpecies);

  const currentTurnPrompt = `[REFERENCE SPECIMENS CATALOGED IN PREHISTORICA PAVILION]:\n${speciesGroundingSnippet}\n\nUser Question: ${query}`;

  const historyContents = validHistory.map((m) => ({
    role: (m.role === 'assistant' || m.role === 'model' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }]
  }));

  const contents = historyContents.length > 0
    ? [...historyContents, { role: 'user' as const, parts: [{ text: currentTurnPrompt }] }]
    : currentTurnPrompt;

  const responseStream = generateContentStreamWithRetry({
    contents,
    config: {
      systemInstruction,
      temperature: 0.3
    }
  });

  let fullResponse = '';

  for await (const chunk of responseStream) {
    const chunkText = chunk.text || '';
    if (chunkText) {
      fullResponse += chunkText;
      yield chunkText;
    }
  }

  // Extract species IDs referenced in the response
  const referencedSpecies: number[] = [];
  contextSpecies.forEach(s => {
    if (fullResponse.includes(`/species/${s.id}`) || fullResponse.toLowerCase().includes(s.name.toLowerCase())) {
      referencedSpecies.push(s.id);
    }
  });

  return {
    response: fullResponse,
    referencedSpecies
  };
}

/**
 * 2. Fossil Lens — Multimodal Vertebrate Osteology Analysis
 */
export interface FossilAnalysisResult {
  fossilAuthenticity: 'Likely Authentic Fossil' | 'Probable Pseudofossil / Concretion' | 'Cast / Modern Replica' | 'Inconclusive';
  anatomicalElement: string;
  probableTaxa: string[];
  morphologicalObservations: string[];
  candidatePrehistoricaSpecies: {
    speciesId?: number;
    name: string;
    scientificName: string;
    clade: string;
    confidence: 'High' | 'Moderate' | 'Tentative';
    rationale: string;
  }[];
  overallConfidence: number; // 0 to 100
  preservationNotes: string;
  recommendedFurtherTests: string[];
}

export async function analyzeFossilImage({
  imageBase64,
  mimeType = 'image/jpeg'
}: {
  imageBase64: string;
  mimeType?: string;
}): Promise<FossilAnalysisResult> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const systemInstruction = `You are a comparative vertebrate paleontologist and taphonomist specializing in fossil osteology.
Analyze the provided fossil photograph with high scientific rigour:
1. Examine surface textures: trabecular bone porosity, haversian canals, enamel schmelzmuster, denticle/carinae density, or mineral concretion banding.
2. Determine if it is a genuine vertebrate fossil, a rock/pseudofossil (e.g. septarian nodule, chert nodule), or a cast.
3. Identify the anatomical element (e.g. theropod tooth crown, sauropod caudal vertebra, osteoderm, ammonite septa).
4. Propose candidate taxa and link to known Mesozoic/Paleozoic clades.
5. Provide strict JSON matching the requested schema.`;

  const prompt = `Analyze this specimen photograph. Provide strict JSON matching this exact structure:
{
  "fossilAuthenticity": "Likely Authentic Fossil" | "Probable Pseudofossil / Concretion" | "Cast / Modern Replica" | "Inconclusive",
  "anatomicalElement": "string",
  "probableTaxa": ["string"],
  "morphologicalObservations": ["string"],
  "candidatePrehistoricaSpecies": [
    {
      "name": "Genus name",
      "scientificName": "Binomial name",
      "clade": "Theropod | Sauropod | Ornithischian | etc.",
      "confidence": "High | Moderate | Tentative",
      "rationale": "Detailed anatomical justification"
    }
  ],
  "overallConfidence": 85,
  "preservationNotes": "string",
  "recommendedFurtherTests": ["string"]
}`;

  const response = await generateContentWithRetry({
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: prompt }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  });

  const rawJson = response.text || '{}';
  return JSON.parse(rawJson) as FossilAnalysisResult;
}

/**
 * 3. Caliper Runway — Biomechanical Interaction & Matchup Engine
 */
export interface RunwayInteractionResult {
  coexisted: boolean;
  temporalGapMa: number;
  temporalVerdict: string;
  geographicOverlap: boolean;
  geographicNotes: string;
  physicalComparison: {
    speciesA: { name: string; lengthM: number; massKg: number; heightM: number; estimatedBiteForceN?: number };
    speciesB: { name: string; lengthM: number; massKg: number; heightM: number; estimatedBiteForceN?: number };
    massRatio: number;
    kineticAdvantage: string;
  };
  biomechanicalBreakdown: {
    offensiveCapabilities: string;
    defensiveCapabilities: string;
    locomotionAndAgility: string;
    lethalVulnerabilities: string;
  };
  ecologicalInteractionNarrative: string;
  curatorConclusion: string;
}

export async function simulateRunwayInteraction({
  speciesA,
  speciesB
}: {
  speciesA: any;
  speciesB: any;
}): Promise<RunwayInteractionResult> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  // Deterministic chronological calculation
  const hasTemporalOverlap = !(speciesA.myaEnd > speciesB.myaStart || speciesB.myaEnd > speciesA.myaStart);
  const temporalGap = hasTemporalOverlap
    ? 0
    : Math.round(Math.abs(Math.min(speciesA.myaEnd, speciesB.myaEnd) - Math.max(speciesA.myaStart, speciesB.myaStart)) * 10) / 10;

  const prompt = `Simulate an evidence-based paleontological, biomechanical, and ecological interaction between:
Specimen 1: ${speciesA.name} (${speciesA.scientificName})
- Clade: ${speciesA.clade} | Diet: ${speciesA.diet} | Habitat: ${speciesA.habitat}
- Temporal: ${speciesA.myaStart}–${speciesA.myaEnd} Ma (${speciesA.timePeriod})
- Geography: ${speciesA.geographicRange || 'N/A'}
- Anatomy & Notes: ${speciesA.sizeNotes || ''}

Specimen 2: ${speciesB.name} (${speciesB.scientificName})
- Clade: ${speciesB.clade} | Diet: ${speciesB.diet} | Habitat: ${speciesB.habitat}
- Temporal: ${speciesB.myaStart}–${speciesB.myaEnd} Ma (${speciesB.timePeriod})
- Geography: ${speciesB.geographicRange || 'N/A'}
- Anatomy & Notes: ${speciesB.sizeNotes || ''}

Stratigraphic Reality:
- Coexistence: ${hasTemporalOverlap ? 'YES, coexisted in deep time' : `NO, separated by ${temporalGap} million years`}

Provide strict JSON conforming to this structure:
{
  "coexisted": ${hasTemporalOverlap},
  "temporalGapMa": ${temporalGap},
  "temporalVerdict": "string explaining their chronological relation",
  "geographicOverlap": boolean,
  "geographicNotes": "string detailing continental / formation differences",
  "physicalComparison": {
    "speciesA": { "name": "${speciesA.name}", "lengthM": number, "massKg": number, "heightM": number, "estimatedBiteForceN": number },
    "speciesB": { "name": "${speciesB.name}", "lengthM": number, "massKg": number, "heightM": number, "estimatedBiteForceN": number },
    "massRatio": number,
    "kineticAdvantage": "string"
  },
  "biomechanicalBreakdown": {
    "offensiveCapabilities": "string",
    "defensiveCapabilities": "string",
    "locomotionAndAgility": "string",
    "lethalVulnerabilities": "string"
  },
  "ecologicalInteractionNarrative": "Realistic scientific encounter narrative",
  "curatorConclusion": "Concluding summary of behavioral dynamics"
}`;

  const response = await generateContentWithRetry({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  return JSON.parse(response.text || '{}') as RunwayInteractionResult;
}

/**
 * 5. Deep-Time Paleo-Biome & Trophic Food Web Synthesizer
 */
export interface TrophicNode {
  id: string;
  name: string;
  scientificName?: string;
  speciesId?: number;
  trophicLevel: 'Primary Producer' | 'Primary Consumer (Herbivore)' | 'Mesopredator' | 'Apex Predator' | 'Scavenger / Decomposer';
  diet: string;
  relativeBiomassPercent: number; // e.g. 60 for producers, 1 for apex
}

export interface TrophicEdge {
  source: string; // prey or producer id
  target: string; // consumer id
  interactionType: 'grazing' | 'predation' | 'scavenging';
  strength: 'dominant' | 'opportunistic';
}

export interface FormationFoodWebResult {
  formationName: string;
  era: string;
  paleoenvironment: string;
  climate: string;
  nodes: TrophicNode[];
  edges: TrophicEdge[];
  trophicPyramidSummary: string;
  stressorScenario?: {
    stressorName: string;
    impactDescription: string;
    vulnerableSpecies: string[];
    resilientSpecies: string[];
  };
}

export async function synthesizeFormationFoodWeb({
  formationName,
  era,
  speciesInFormation,
  stressor
}: {
  formationName: string;
  era: string;
  speciesInFormation: any[];
  stressor?: string;
}): Promise<FormationFoodWebResult> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const speciesListText = speciesInFormation.map(s => 
    `- ${s.name} (${s.scientificName}, Clade: ${s.clade}, Diet: ${s.diet}, Size: ${s.sizeNotes || ''})`
  ).join('\n');

  const prompt = `Synthesize a realistic paleoecological trophic food web for the:
Formation: ${formationName}
Era: ${era}
Known cataloged species from this formation in Prehistorica:
${speciesListText || 'Synthesize representative flora, fauna, invertebrates, and apex taxa for this formation.'}

${stressor ? `Simulate Environmental Stressor: "${stressor}" (e.g. marine transgression, volcanic eruption, aridification, or asteroid winter).` : ''}

Generate strict JSON matching this exact structure:
{
  "formationName": "${formationName}",
  "era": "${era}",
  "paleoenvironment": "string describing climate, water bodies, and vegetation",
  "climate": "string",
  "nodes": [
    {
      "id": "unique-id",
      "name": "Common or Genus name",
      "scientificName": "Binomial name",
      "speciesId": number or null,
      "trophicLevel": "Primary Producer" | "Primary Consumer (Herbivore)" | "Mesopredator" | "Apex Predator" | "Scavenger / Decomposer",
      "diet": "string",
      "relativeBiomassPercent": number
    }
  ],
  "edges": [
    {
      "source": "prey-id",
      "target": "predator-id",
      "interactionType": "grazing" | "predation" | "scavenging",
      "strength": "dominant" | "opportunistic"
    }
  ],
  "trophicPyramidSummary": "Concise summary of energy transfer efficiency",
  "stressorScenario": {
    "stressorName": "${stressor || 'Baseline Stability'}",
    "impactDescription": "string",
    "vulnerableSpecies": ["string"],
    "resilientSpecies": ["string"]
  }
}`;

  const response = await generateContentWithRetry({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  return JSON.parse(response.text || '{}') as FormationFoodWebResult;
}
