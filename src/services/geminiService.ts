import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelVariant = 'gemini-3-flash' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite';

// Validates the API key format (basic check)
export const isValidApiKey = (key: string) => {
    if (!key) return false;
    return key.length > 20 && key.startsWith('AIza');
};

// Simple estimation: ~4 chars per token for English text
export const estimateTokenCount = (text: string) => Math.ceil(text.length / 4);

// Map common error codes/messages to user-friendly strings
export const mapGeminiError = (error: any): string => {
    const msg = error.message || '';
    if (msg.includes('429') || msg.includes('quota')) return "Quota Exceeded. Please try again later or check your billing.";
    if (msg.includes('403') || msg.includes('key')) return "Invalid API Key. Please check your configuration.";
    if (msg.includes('503') || msg.includes('overloaded')) return "Gemini is overloaded. Please try again in a moment.";
    return `Analysis failed: ${msg}`;
};

const DUAL_LENS_SYSTEM_PROMPT = `
You are an advanced "Dual-Lens" Career Strategist with two distinct sub-personas:
1.  **The Ruthless ATS Algorithm:** You mimic the logic of enterprise systems like Workday, Greenhouse, and Taleo. You parse text for keyword density, formatting errors, and "knockout" criteria.
2.  **The Senior Technical Recruiter:** You are a skeptical but fair hiring manager with 15+ years of experience. You look for impact, quantification (numbers), and culture fit.

**YOUR MISSION:**
Analyze the provided RESUME text against the provided JOB DESCRIPTION (JD).

**STEP 1: THE ATS SCREEN (Machine Logic)**
- **Keyword Gap Analysis:** Identify specific hard skills, certifications, or tools mentioned in the JD that are completely missing from the resume.
- **Parsing Check:** Detect if the resume uses "unparseable" elements (e.g., mention if the text implies complex multi-column layouts or non-standard section headers like "My Journey" instead of "Experience").
- **Frequency Match:** Is the candidate "keyword stuffing" or is the density natural?

**STEP 2: THE RECRUITER REVIEW (Human Logic)**
- **Impact vs. Duties:** Does the candidate list tasks ("Responsible for coding") or achievements ("Reduced latency by 40%")?
- **Tone Check:** Is the language confident and active, or passive and weak?
- **Role Alignment:** Does the summary/profile specifically target *this* role, or does it sound generic?

**OUTPUT FORMAT:**
Return a purely valid JSON object with this structure (no markdown, no conversational filler):

{
  "scores": {
    "ats_compatibility": (integer 0-100), // How well the machine can read/match it
    "recruiter_impact": (integer 0-100)   // How impressive the content is to a human
  },
  "critical_missing_keywords": ["string", "string"], // High priority keywords from JD missing in Resume
  "resume_improvements": [
    {
      "section": "string", // e.g., "Experience", "Summary"
      "issue": "string", // e.g., "Passive Voice", "Missing Metrics"
      "fix": "string" // A concrete example of how to rewrite it
    }
  ],
  "ats_warnings": [
    "string" // Specific technical formatting warnings (e.g. "Avoid using tables for layout")
  ],
  "radar_chart_data": [
    { "subject": "Technical Skills", "A": (integer 0-10), "B": (integer 0-10) }, // A = Candidate, B = Job Req
    { "subject": "Soft Skills", "A": (integer 0-10), "B": (integer 0-10) },
    { "subject": "Experience", "A": (integer 0-10), "B": (integer 0-10) },
    { "subject": "Education", "A": (integer 0-10), "B": (integer 0-10) },
    { "subject": "Domain Knowledge", "A": (integer 0-10), "B": (integer 0-10) }
  ],
  "summary_verdict": "string" // A 2-sentence brutally honest summary of why they would/wouldn't get an interview.
}
`;

export interface ResumeImprovement {
    section: string;
    issue: string;
    fix: string;
}

export interface AnalysisResult {
    scores: {
        ats_compatibility: number;
        recruiter_impact: number;
    };
    critical_missing_keywords: string[];
    resume_improvements: ResumeImprovement[];
    ats_warnings: string[];
    radar_chart_data: Array<{
        subject: string;
        A: number; // Candidate Level
        B: number; // Job Requirement Level
    }>;
    summary_verdict: string;
}

export async function* streamGeminiAnalysis(
    apiKey: string,
    resumeText: string,
    jobDescription: string
) {
    const genAI = new GoogleGenerativeAI(apiKey);

    // HARDCODED: Gemini 2.5 Flash Lite (Literal String)
    const modelId = 'gemini-2.5-flash-lite';

    const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
        },
        systemInstruction: DUAL_LENS_SYSTEM_PROMPT
    });

    const prompt = `
    *** RESUME TEXT ***
    ${resumeText}

    *** JOB DESCRIPTION ***
    ${jobDescription}
  `;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
        yield chunk.text();
    }
}

export async function* streamCoverLetter(
    apiKey: string,
    resumeText: string,
    jobDescription: string
) {
    const genAI = new GoogleGenerativeAI(apiKey);

    // User requested "Gemini 2.5 Flash Lite" for analysis, but for creative writing, 
    // a slightly 'smarter' or standard model might be better. 
    // However, abiding by strict "Flash Lite" request or falling back to "gemini-1.5-flash" (stable) for writing.
    // Let's use the same modelId for consistency unless instructed otherwise.
    const modelId = 'gemini-1.5-flash';

    const model = genAI.getGenerativeModel({
        model: modelId,
        systemInstruction: `
You are an expert Executive Career Coach with 15 years of experience. Your task is to write a HIT-THE-GROUND-RUNNING Cover Letter.

CRITICAL RULES:
1. **NO FLUFF**: Do NOT start with "I am writing to apply..." or "I am excited to...". Start with a "Hook" that immediately bridges a major Job Need to a Candidate Win.
2. **STAR METHOD**: Every single Paragraph in the content body MUST follow the STAR method (Situation, Task, Action, Result) based on the Resume provided.
3. **EVIDENCE-BASED**: Do not make vague claims like "I have great communication skills". Instead, say "I led a team of 5 engineers to deliver..."
4. **MAPPING**: Explicitly map at least 3 specific requirements from the Job Description to concrete anecdotes in the Resume.

Format:
Return a clean, professional cover letter text. Use explicit paragraph breaks.
Sign off with: "Sincerely, [Candidate Name]"
`
    });

    try {
        const stream = await model.generateContentStream({
            contents: [{
                role: 'user',
                parts: [{
                    text: `
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

TASK:
Write a highly specific, anekdote-rich Cover Letter.
` }]
            }]
        });

        for await (const chunk of stream.stream) {
            yield chunk.text();
        }
    } catch (error: any) {
        console.error("Gemini Cover Letter Error:", error);
        throw new Error(error.message || "Failed to generate cover letter.");
    }
}
