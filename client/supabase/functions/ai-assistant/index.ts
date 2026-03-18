import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── File Text Extraction ────────────────────────────────────────────────────

async function extractText(
  url: string,
  fileName: string,
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  // Code / text files — read directly
  const textExts = [
    "txt", "md", "js", "ts", "jsx", "tsx", "py", "java", "c", "cpp",
    "cs", "go", "rb", "php", "html", "css", "json", "yaml", "yml",
    "xml", "sh", "sql", "r", "swift", "kt", "rs",
  ];

  // Helper to safely fetch with error check
  const safeFetch = async (u: string) => {
    const r = await fetch(u);
    if (!r.ok) throw new Error(`Fetch failed for ${fileName}: ${r.status} ${r.statusText}`);
    return r;
  };

  if (textExts.includes(ext)) {
    const res = await safeFetch(url);
    const text = await res.text();
    return text.slice(0, 12000);
  }

  // PDF
  if (ext === "pdf") {
    try {
      const res = await safeFetch(url);
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const raw = new TextDecoder("latin1").decode(bytes);
      // Basic PDF text extraction
      const matches = [...raw.matchAll(/BT\s*([\s\S]*?)\s*ET/g)];
      const texts: string[] = [];
      for (const match of matches) {
        const block = match[1];
        const strMatches = [...block.matchAll(/\((.*?)\)/g)];
        for (const s of strMatches) {
          const cleaned = s[1].replace(/\\n/g, "\n").replace(/\\/g, "");
          if (cleaned.trim()) texts.push(cleaned);
        }
      }
      return texts.join(" ").slice(0, 12000) || `[PDF file: ${fileName} — no readable text extracted]`;
    } catch (e) {
      return `[PDF file: ${fileName} — Error during extraction: ${e instanceof Error ? e.message : String(e)}]`;
    }
  }

  // DOCX
  if (ext === "docx") {
    try {
      const res = await safeFetch(url);
      const buffer = await res.arrayBuffer();
      const { default: JSZip } = await import("npm:jszip@3.10.1");
      const zip = await (JSZip as any).loadAsync(buffer);
      const docXml = zip.file("word/document.xml");
      if (!docXml) return `[DOCX file: ${fileName} — could not find word/document.xml]`;
      const xmlText = await docXml.async("text");
      const text = xmlText.replace(/<w:p[^>]*>/g, "\n").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return text.slice(0, 12000) || `[DOCX file: ${fileName} — empty or unreadable]`;
    } catch (e) {
      return `[DOCX file: ${fileName} — Error: ${e instanceof Error ? e.message : String(e)}]`;
    }
  }

  // PPTX
  if (ext === "pptx") {
    try {
      const res = await safeFetch(url);
      const buffer = await res.arrayBuffer();
      const { default: JSZip } = await import("npm:jszip@3.10.1");
      const zip = await (JSZip as any).loadAsync(buffer);
      const slideTexts: string[] = [];
      const slideFiles = Object.keys(zip.files).filter((f) => f.match(/^ppt\/slides\/slide\d+\.xml$/)).sort();
      for (const sf of slideFiles) {
        const xmlText = await zip.files[sf].async("text");
        const text = xmlText.replace(/<a:t[^>]*>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        if (text) slideTexts.push(text);
      }
      return slideTexts.join("\n\n").slice(0, 12000) || `[PPTX file: ${fileName} — empty or unreadable]`;
    } catch (e) {
      return `[PPTX file: ${fileName} — Error: ${e instanceof Error ? e.message : String(e)}]`;
    }
  }

  return `[Image file: ${fileName}]`;
}

// ─── AI API Callers ──────────────────────────────────────────────────────────

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Gemini API error");
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Groq API error");
  return data.choices?.[0]?.message?.content ?? "No response.";
}

async function callMistral(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Mistral API error");
  return data.choices?.[0]?.message?.content ?? "No response.";
}

// ─── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { groupId, query, model, apiKey } = await req.json();

    if (!groupId || !query || !model) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (groupId, query, model)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Determine which API key to use
    let activeApiKey = apiKey;
    
    // Default keys from environment variables if not provided by user
    if (!activeApiKey) {
      if (model === "gemini") activeApiKey = Deno.env.get("GEMINI_API_KEY");
      else if (model === "groq") activeApiKey = Deno.env.get("GROQ_API_KEY");
      else if (model === "mistral") activeApiKey = Deno.env.get("MISTRAL_API_KEY");
    }

    if (!activeApiKey) {
      return new Response(
        JSON.stringify({ error: `No API key found for model: ${model}. Please provide one in the request or configure secrets.` }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Init Supabase admin client (service role)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch group files
    const { data: files, error: filesErr } = await supabase
      .from("group_files")
      .select("file_name, file_path")
      .eq("group_id", groupId);

    if (filesErr) throw filesErr;

    // 2. Extract text from each file
    const fileContexts: string[] = [];
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    if (files && files.length > 0) {
      for (const file of files) {
        if (!file.file_path) continue;
        // Build the public storage URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/group-assets/${file.file_path}`;
        try {
          const text = await extractText(publicUrl, file.file_name);
          fileContexts.push(`--- File: ${file.file_name} ---\n${text}`);
        } catch {
          fileContexts.push(`--- File: ${file.file_name} --- [could not read]`);
        }
      }
    }

    // 3. Build system prompt
    const systemContext = fileContexts.length > 0
      ? `You are a helpful AI assistant for a collaborative learning group. 
The group has uploaded the following files. Use them as context to answer the user's question.
If the question can be answered from the files, do so with specific references.
If not, answer based on general knowledge.

=== GROUP FILES ===
${fileContexts.join("\n\n")}
==================`
      : `You are a helpful AI assistant for a collaborative learning group. 
No files have been uploaded to this group yet. Answer based on your general knowledge.`;

    const fullPrompt = `${systemContext}\n\nUser question: ${query}`;

    // 4. Call AI
    let response: string;
    if (model === "gemini") {
      response = await callGemini(activeApiKey, fullPrompt);
    } else if (model === "groq") {
      response = await callGroq(activeApiKey, fullPrompt);
    } else if (model === "mistral") {
      response = await callMistral(activeApiKey, fullPrompt);
    } else {
      throw new Error(`Unknown model: ${model}`);
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
