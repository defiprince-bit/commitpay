// AI judge + anti-cheat critic + escape interview. Mock when no GROQ_API_KEY / GEMINI_API_KEY.
export type Flags = { stock?: boolean; reused?: boolean; aiGenerated?: boolean; dayMismatch?: boolean };
export type Verdict = { verdict: "accept" | "reject"; reasons: string[]; flags: Flags };
export type Turn = { role: "assistant" | "user"; content: string };

export const aiMode = () => (process.env.GROQ_API_KEY ? "groq" : process.env.GEMINI_API_KEY ? "gemini" : "mock");
const antiCheat = () => process.env.FEATURE_ANTI_CHEAT !== "0";

/** Free Groq keys often only expose text models (e.g. qwen / gpt-oss). Override via env. */
const GROQ_TEXT_MODEL = () => process.env.GROQ_TEXT_MODEL || "qwen/qwen3.8-27b";
const GROQ_VISION_MODEL = () => process.env.GROQ_VISION_MODEL || ""; // empty = no vision on this key

async function llmJson(system: string, user: string, imageUrl?: string): Promise<any> {
  if (process.env.GROQ_API_KEY) {
    const vision = Boolean(imageUrl && GROQ_VISION_MODEL());
    const content: any[] = [{ type: "text", text: user }];
    if (vision) content.push({ type: "image_url", image_url: { url: imageUrl } });
    else if (imageUrl) content[0].text += "\n(Image was uploaded; this Groq key has no vision model, so judge from goal/note/filename only.)";
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: vision ? GROQ_VISION_MODEL() : GROQ_TEXT_MODEL(), temperature: 0,
        response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content }] }) });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      throw new Error(`Groq ${r.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
    }
    return JSON.parse((await r.json()).choices[0].message.content);
  }
  const parts: any[] = [{ text: `${system}\n\n${user}` }];
  if (imageUrl?.startsWith("data:")) {
    const [, mime, b64] = imageUrl.match(/^data:(.+?);base64,(.*)$/) || [];
    if (b64) parts.push({ inline_data: { mime_type: mime, data: b64 } });
  }
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: "application/json" } }) });
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  return JSON.parse((await r.json()).candidates[0].content.parts[0].text);
}

const JUDGE_SYS = `You are CommitPay's anti-cheat referee. Decide if the proof shows the user did the goal.
Flag: stock (stock/marketing photo), reused (seen-before/screenshot of web image), aiGenerated, dayMismatch.
Any hard flag => reject. Return JSON {"verdict":"accept"|"reject","reasons":string[],"flags":{...}}. Reasons: short plain bullets.`;

export async function judgeProof(goal: string, proof: { storageUrl?: string; sourceUrl?: string; note?: string }): Promise<Verdict> {
  if (aiMode() === "mock") {
    // Demo heuristic: filenames/notes/URLs hinting stock/fake → reject; otherwise accept.
    const hay = `${proof.storageUrl?.slice(0, 200) ?? ""} ${proof.sourceUrl ?? ""} ${proof.note ?? ""}`.toLowerCase();
    if (antiCheat() && /stock|shutterstock|getty|unsplash|fake|ai-gen|midjourney|sample/.test(hay))
      return { verdict: "reject", flags: { stock: true, aiGenerated: /ai-gen|midjourney/.test(hay) },
        reasons: ["Stock / reused photo likely", "Does not match goal context", "No sign this was taken this week"] };
    return { verdict: "accept", flags: {}, reasons: ["Proof matches goal", "No stock or reuse signals"] };
  }
  const imageUrl = proof.storageUrl?.startsWith("data:") || proof.storageUrl?.startsWith("http") ? proof.storageUrl : undefined;
  // No vision model on many free Groq keys: keep demo-reliable filename anti-cheat, then text judge.
  if (aiMode() === "groq" && imageUrl && !GROQ_VISION_MODEL() && antiCheat()) {
    const hay = `${proof.storageUrl?.slice(0, 200) ?? ""} ${proof.sourceUrl ?? ""} ${proof.note ?? ""}`.toLowerCase();
    if (/stock|shutterstock|getty|unsplash|fake|ai-gen|midjourney|sample/.test(hay))
      return { verdict: "reject", flags: { stock: true, aiGenerated: /ai-gen|midjourney/.test(hay) },
        reasons: ["Stock / reused photo likely", "Does not match goal context", "No sign this was taken this week"] };
  }
  const v = await llmJson(JUDGE_SYS, `Goal: ${goal}\nSource URL: ${proof.sourceUrl ?? "none"}\nNote: ${proof.note ?? ""}`,
    GROQ_VISION_MODEL() ? imageUrl : undefined);
  const flags: Flags = v.flags || {};
  const hard = antiCheat() && (flags.stock || flags.aiGenerated || flags.dayMismatch || flags.reused);
  return { verdict: hard ? "reject" : v.verdict === "accept" ? "accept" : "reject", reasons: v.reasons || [], flags };
}

export const ESCAPE_QUESTIONS = [
  "What happened that stopped you this week?",
  "When did it happen, roughly which day?",
  "Why couldn't you do even a smaller version of the goal?",
];

/** Returns next question, or final verdict after 3 answers. */
export async function escapeTurn(goal: string, transcript: Turn[]): Promise<{ question?: string; verdict?: "pass" | "fail"; reason?: string }> {
  const answers = transcript.filter((t) => t.role === "user");
  if (answers.length < ESCAPE_QUESTIONS.length) return { question: ESCAPE_QUESTIONS[answers.length] };
  if (aiMode() === "mock") {
    const vague = answers.some((a) => a.content.trim().split(/\s+/).length < 4 || /idk|lazy|forgot|didn.?t feel/i.test(a.content));
    return vague ? { verdict: "fail", reason: "Answers were vague or described a choice, not an emergency." }
                 : { verdict: "pass", reason: "Specific, consistent account of a real disruption." };
  }
  const v = await llmJson(
    `You judge CommitPay's one-time "life happened" escape interview. Be fair and human, not pedantic.
Pass when the story is a real disruption (illness, family emergency, travel mess, injury) and answers are consistent, even if short.
Fail only clear laziness, jokes, contradictions, or empty replies.
Return JSON {"verdict":"pass"|"fail","reason":string}. Reason: one plain sentence the user can read.`,
    `Goal: ${goal}\nTranscript:\n${transcript.map((t) => `${t.role}: ${t.content}`).join("\n")}`);
  return { verdict: v.verdict === "pass" ? "pass" : "fail", reason: v.reason || (v.verdict === "pass" ? "That checks out — hold released." : "That wasn't specific enough.") };
}
