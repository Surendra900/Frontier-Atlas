import pg from "pg";

const shards = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

function normalizeVendor(vendorRaw, id) {
  const v = (vendorRaw || "").toLowerCase().trim();
  if (v.includes("openai") || id.startsWith("openai/")) return "OpenAI";
  if (v.includes("anthropic") || id.startsWith("anthropic/")) return "Anthropic";
  if (v.includes("google") || id.startsWith("google/")) return "Google";
  if (v.includes("meta") || id.startsWith("meta-llama/") || id.startsWith("meta/")) return "Meta";
  if (v.includes("mistral") || id.startsWith("mistralai/") || id.startsWith("mistral/")) return "Mistral AI";
  if (v.includes("deepseek") || id.startsWith("deepseek/")) return "DeepSeek";
  if (v.includes("qwen") || v.includes("alibaba") || id.startsWith("qwen/")) return "Alibaba";
  if (v.includes("cohere") || id.startsWith("cohere/")) return "Cohere";
  if (v.includes("amazon") || id.startsWith("amazon/")) return "Amazon";
  if (v.includes("xai") || v.includes("x-ai") || id.startsWith("x-ai/")) return "xAI";
  if (v.includes("microsoft") || id.startsWith("microsoft/")) return "Microsoft";
  if (v.includes("nvidia") || id.startsWith("nvidia/")) return "NVIDIA";
  if (v.includes("bytedance") || id.startsWith("bytedance/")) return "ByteDance";
  if (v.includes("01-ai") || id.startsWith("01-ai/")) return "01.AI";
  if (v.includes("minimax") || id.startsWith("minimax/")) return "MiniMax";
  if (v.includes("moonshot") || id.startsWith("moonshot/")) return "Moonshot AI";
  if (v.includes("perplexity") || id.startsWith("perplexity/")) return "Perplexity";
  if (v.includes("groq")) return "Groq";
  if (v.includes("cerebras")) return "Cerebras";
  if (v.includes("together")) return "Together AI";
  if (v.includes("deepinfra")) return "DeepInfra";
  if (v.includes("tencent")) return "Tencent";
  if (v.includes("baidu")) return "Baidu";
  return vendorRaw ? vendorRaw.charAt(0).toUpperCase() + vendorRaw.slice(1) : "AI Lab";
}

function inferModelFamily(name, id) {
  const target = `${name} ${id}`.toLowerCase();
  if (target.includes("gpt-4") || target.includes("gpt-4o")) return "GPT-4";
  if (target.includes("gpt-3") || target.includes("gpt-3.5")) return "GPT-3";
  if (target.includes("o1") || target.includes("o3")) return "OpenAI o-Series";
  if (target.includes("claude-3-7") || target.includes("claude 3.7")) return "Claude 3.7";
  if (target.includes("claude-3-5") || target.includes("claude 3.5")) return "Claude 3.5";
  if (target.includes("claude-3") || target.includes("claude 3")) return "Claude 3";
  if (target.includes("claude")) return "Claude";
  if (target.includes("llama-3.3") || target.includes("llama 3.3")) return "Llama 3.3";
  if (target.includes("llama-3.2") || target.includes("llama 3.2")) return "Llama 3.2";
  if (target.includes("llama-3.1") || target.includes("llama 3.1")) return "Llama 3.1";
  if (target.includes("llama-3") || target.includes("llama 3")) return "Llama 3";
  if (target.includes("llama")) return "Llama";
  if (target.includes("gemini-2") || target.includes("gemini 2")) return "Gemini 2";
  if (target.includes("gemini-1.5") || target.includes("gemini 1.5")) return "Gemini 1.5";
  if (target.includes("gemini")) return "Gemini";
  if (target.includes("gemma")) return "Gemma";
  if (target.includes("deepseek-r1") || target.includes("deepseek r1")) return "DeepSeek R1";
  if (target.includes("deepseek-v3") || target.includes("deepseek v3")) return "DeepSeek V3";
  if (target.includes("deepseek")) return "DeepSeek";
  if (target.includes("mistral-large") || target.includes("mistral large")) return "Mistral Large";
  if (target.includes("mistral-small") || target.includes("mistral small")) return "Mistral Small";
  if (target.includes("codestral") || target.includes("devstral")) return "Codestral";
  if (target.includes("pixtral")) return "Pixtral";
  if (target.includes("mistral")) return "Mistral";
  if (target.includes("qwen-2.5") || target.includes("qwen2.5")) return "Qwen 2.5";
  if (target.includes("qwq")) return "QwQ";
  if (target.includes("qwen")) return "Qwen";
  if (target.includes("command-r") || target.includes("command r")) return "Command R";
  if (target.includes("command")) return "Command";
  if (target.includes("grok")) return "Grok";
  if (target.includes("phi-4") || target.includes("phi 4")) return "Phi-4";
  if (target.includes("phi-3") || target.includes("phi 3")) return "Phi-3";
  if (target.includes("phi")) return "Phi";
  return "General Models";
}

function inferCategory(capabilities, name, id) {
  const target = `${name} ${id}`.toLowerCase();
  if (capabilities.includes("reasoning") || target.includes("r1") || target.includes("o1") || target.includes("o3") || target.includes("reason")) {
    return "Reasoning";
  }
  if (capabilities.includes("vision") || target.includes("vision") || target.includes("vl") || target.includes("pixtral")) {
    return "Vision";
  }
  if (capabilities.includes("code") || target.includes("coder") || target.includes("codestral")) {
    return "Code Generation";
  }
  if (capabilities.includes("audio") || target.includes("whisper") || target.includes("speech") || target.includes("audio")) {
    return "Audio";
  }
  if (target.includes("embed")) {
    return "Embeddings";
  }
  return "General LLM";
}

async function fetchSources() {
  console.log("1. Fetching OpenRouter models...");
  let openRouterModels = [];
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", { signal: AbortSignal.timeout(15000) });
    const json = await res.json();
    openRouterModels = json.data || [];
    console.log(`✓ Fetched ${openRouterModels.length} models from OpenRouter.`);
  } catch (e) {
    console.warn("OpenRouter fetch failed:", e.message);
  }

  console.log("2. Fetching models.dev catalog...");
  let modelsDevMap = new Map();
  try {
    const res = await fetch("https://models.dev/api.json", { signal: AbortSignal.timeout(15000) });
    const json = await res.json();
    for (const [providerKey, providerObj] of Object.entries(json || {})) {
      const pName = providerObj.name || providerKey;
      for (const [mKey, mVal] of Object.entries(providerObj.models || {})) {
        modelsDevMap.set(mKey.toLowerCase(), { ...mVal, providerName: pName });
        const parts = mKey.split("/");
        if (parts.length > 1) {
          modelsDevMap.set(parts[1].toLowerCase(), { ...mVal, providerName: pName });
        }
      }
    }
    console.log(`✓ Parsed ${modelsDevMap.size} model definitions from models.dev.`);
  } catch (e) {
    console.warn("models.dev fetch failed:", e.message);
  }

  return { openRouterModels, modelsDevMap };
}

function normalizeAndMerge(sources) {
  const { openRouterModels, modelsDevMap } = sources;
  const mergedMap = new Map();

  for (const m of openRouterModels) {
    const rawId = m.id;
    const cleanSlug = rawId.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    const vendor = normalizeVendor(rawId.split("/")[0], rawId);
    const cleanName = m.name?.replace(/^[A-Za-z0-9\s.-]+:\s*/, "") || rawId;

    const capabilities = new Set();
    const params = m.supported_parameters || [];
    if (params.includes("tools") || params.includes("tool_choice")) capabilities.add("tools");
    if (params.includes("structured_outputs") || params.includes("response_format")) capabilities.add("structured_output");
    if (params.includes("reasoning") || m.reasoning?.default_enabled || cleanName.toLowerCase().includes("r1") || cleanName.toLowerCase().includes("o1") || cleanName.toLowerCase().includes("o3")) {
      capabilities.add("reasoning");
    }

    const inputMods = m.architecture?.input_modalities || [];
    if (inputMods.includes("image")) capabilities.add("vision");
    if (inputMods.includes("audio")) capabilities.add("audio");
    if (cleanName.toLowerCase().includes("code") || cleanName.toLowerCase().includes("coder")) capabilities.add("code");

    let modality = "text";
    if (inputMods.includes("image")) modality = "multimodal";
    else if (inputMods.includes("audio")) modality = "audio";

    const promptPrice = m.pricing?.prompt ? parseFloat(m.pricing.prompt) * 1000000 : null;
    const completionPrice = m.pricing?.completion ? parseFloat(m.pricing.completion) * 1000000 : null;

    const mdInfo = modelsDevMap.get(rawId.toLowerCase()) || modelsDevMap.get(cleanSlug) || modelsDevMap.get(rawId.split("/")[1]?.toLowerCase());
    const isOpenWeights = mdInfo?.open_weights === true ||
      rawId.toLowerCase().includes("deepseek") ||
      rawId.toLowerCase().includes("llama") ||
      rawId.toLowerCase().includes("qwen") ||
      rawId.toLowerCase().includes("mistral") ||
      rawId.toLowerCase().includes("gemma");

    const opennessType = isOpenWeights ? "Open Weights" : "Proprietary";
    const accessType = isOpenWeights ? "Open Weights / API" : "Commercial API";

    const family = inferModelFamily(cleanName, rawId);
    const category = inferCategory(Array.from(capabilities), cleanName, rawId);

    let releaseDate = m.created ? new Date(m.created * 1000) : null;
    if (mdInfo?.release_date) {
      const parsed = new Date(mdInfo.release_date);
      if (!isNaN(parsed.getTime())) releaseDate = parsed;
    }

    const contextWindow = m.context_length || m.top_provider?.context_length || (mdInfo?.limit?.context) || 128000;
    const maxOutputTokens = m.top_provider?.max_completion_tokens || (mdInfo?.limit?.output) || 4096;

    let trendingScore = 50;
    if (capabilities.has("reasoning")) trendingScore += 30;
    if (capabilities.has("vision")) trendingScore += 15;
    if (contextWindow >= 1000000) trendingScore += 25;
    else if (contextWindow >= 200000) trendingScore += 15;
    if (isOpenWeights) trendingScore += 10;

    mergedMap.set(cleanSlug, {
      id: rawId,
      name: cleanName,
      slug: cleanSlug,
      vendor,
      vendor_logo_url: `https://www.google.com/s2/favicons?domain=${vendor.toLowerCase().replace(/\s+/g, '')}.com&sz=128`,
      description: m.description ? m.description.slice(0, 1500) : `${cleanName} is a high-performance AI model provided by ${vendor}.`,
      parameter_count: rawId.match(/(\d+b)/i)?.[1]?.toUpperCase() || (rawId.includes("405b") ? "405B" : rawId.includes("70b") ? "70B" : rawId.includes("8b") ? "8B" : null),
      modality,
      access_type: accessType,
      openness_type: opennessType,
      release_date: releaseDate,
      model_family: family,
      category,
      capabilities: Array.from(capabilities),
      research_areas: [category, "Artificial Intelligence", "Deep Learning"],
      architecture: m.architecture || {},
      context_window: contextWindow,
      max_output_tokens: maxOutputTokens,
      input_cost_per_mtoken: promptPrice ? Math.round(promptPrice * 100) / 100 : 0,
      output_cost_per_mtoken: completionPrice ? Math.round(completionPrice * 100) / 100 : 0,
      license: isOpenWeights ? "Open / Apache 2.0 / Community" : "Proprietary",
      paper_url: null,
      repository_url: null,
      api_url: `https://openrouter.ai/${rawId}`,
      hugging_face_id: m.hugging_face_id || null,
      trending_score: trendingScore,
    });
  }

  return Array.from(mergedMap.values());
}

async function saveToDatabase(models) {
  console.log(`\nPersisting ${models.length} normalized models to Neon DB shards...`);

  for (const [name, url] of Object.entries(shards)) {
    console.log(`Connecting to ${name}...`);
    const pool = new pg.Pool({ connectionString: url });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const upsertQuery = `
          INSERT INTO models (
            id, name, slug, vendor, vendor_logo_url, description, parameter_count,
            modality, access_type, openness_type, release_date, model_family,
            category, capabilities, research_areas, architecture, context_window,
            max_output_tokens, input_cost_per_mtoken, output_cost_per_mtoken,
            license, paper_url, repository_url, api_url, hugging_face_id,
            trending_score, "createdAt", "updatedAt", created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
            NOW(), NOW(), NOW(), NOW()
          )
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            vendor = EXCLUDED.vendor,
            vendor_logo_url = EXCLUDED.vendor_logo_url,
            description = EXCLUDED.description,
            parameter_count = EXCLUDED.parameter_count,
            modality = EXCLUDED.modality,
            access_type = EXCLUDED.access_type,
            openness_type = EXCLUDED.openness_type,
            release_date = EXCLUDED.release_date,
            model_family = EXCLUDED.model_family,
            category = EXCLUDED.category,
            capabilities = EXCLUDED.capabilities,
            research_areas = EXCLUDED.research_areas,
            architecture = EXCLUDED.architecture,
            context_window = EXCLUDED.context_window,
            max_output_tokens = EXCLUDED.max_output_tokens,
            input_cost_per_mtoken = EXCLUDED.input_cost_per_mtoken,
            output_cost_per_mtoken = EXCLUDED.output_cost_per_mtoken,
            license = EXCLUDED.license,
            api_url = EXCLUDED.api_url,
            hugging_face_id = EXCLUDED.hugging_face_id,
            trending_score = EXCLUDED.trending_score,
            "updatedAt" = NOW(),
            updated_at = NOW();
        `;

        for (const m of models) {
          await client.query(upsertQuery, [
            m.id,
            m.name,
            m.slug,
            m.vendor,
            m.vendor_logo_url,
            m.description,
            m.parameter_count,
            m.modality,
            m.access_type,
            m.openness_type,
            m.release_date,
            m.model_family,
            m.category,
            JSON.stringify(m.capabilities),
            JSON.stringify(m.research_areas),
            JSON.stringify(m.architecture),
            m.context_window,
            m.max_output_tokens,
            m.input_cost_per_mtoken,
            m.output_cost_per_mtoken,
            m.license,
            m.paper_url,
            m.repository_url,
            m.api_url,
            m.hugging_face_id,
            m.trending_score,
          ]);
        }

        await client.query("COMMIT");
        const countRes = await client.query("SELECT COUNT(*) FROM models");
        console.log(`✓ ${name}: Successfully synced models. Total models in DB: ${countRes.rows[0].count}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`✗ ${name} transaction failed:`, err.message);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(`✗ ${name} connection failed:`, err.message);
    } finally {
      await pool.end();
    }
  }
}

async function main() {
  console.log("=== STARTING MODEL DATA INGESTION & NORMALIZATION ===");
  const sources = await fetchSources();
  const normalizedModels = normalizeAndMerge(sources);
  console.log(`Total normalized models to sync: ${normalizedModels.length}`);
  await saveToDatabase(normalizedModels);
  console.log("=== MODEL INGESTION COMPLETED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("FATAL Ingestion error:", err);
  process.exit(1);
});
