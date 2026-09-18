import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient();

// The categories based on the UI design provided
const CATEGORY_MAP: Record<string, string[]> = {
  "General": ["llm", "multi-head-attention", "softmax", "layer-normalization", "mac-tuning"],
  "Language": ["bert", "gpt", "t5", "seq2seq", "attention", "mamba-2", "performer", "bleu", "rouge", "fasttext", "speculative-decoding", "sliding-window-attention", "gated-deltanet"],
  "Vision": ["clip", "llava", "vision-transformer", "sam", "dino", "resnet", "u-net", "convnext", "mask-r-cnn", "yolo", "nerf", "vit", "r-cnn", "swin-transformer"],
  "Audio & Speech": ["whisper", "wavenet", "conformer", "soundstream", "rnn-transducer", "wav2vec", "fast-conformer", "neural-audio-codec", "spectrogram", "tdt"],
  "Agents": ["react", "mcp", "function-calling", "agent-skills", "multi-turn", "tool-use", "autogpt", "agent-frameworks", "planning", "memory"],
  "Reasoning": ["chain-of-thought", "tree-of-thoughts", "grpo", "reasoning-model", "self-refine", "reflection", "deep-research", "xavier-initialization", "context-rot", "test-time-compute"],
  "Training": ["pre-training", "fine-tuning", "peft", "qlora", "prompt-engineering", "data-augmentation", "curriculum-learning", "teacher-forcing", "label-smoothing"],
  "Optimization": ["adam", "adamw", "sgd", "adafactor", "weight-decay", "gradient-clipping", "learning-rate-scheduler", "cosine-annealing", "batch-normalization", "dropout"],
  "Inference": ["kv-cache", "ttft", "prefill", "quantization", "pruning", "distillation", "flash-attention", "vllm"],
  "Retrieval": ["rag", "colbert", "reranker", "bm25", "dense-retrieval", "hybrid-search", "vector-search", "reranking", "embedding-search", "context-retrieval"],
  "Reinforcement Learning": ["ppo", "dpo", "rlhf", "rlvr", "online-rl", "muzero", "alphazero", "reinforce", "reward-model"],
  "Diffusion & Generation": ["stable-diffusion", "dit", "flow-matching", "diffusion-policy", "vae", "gan", "biggan", "score-based-models", "generative-adversarial-networks", "inpainting"],
  "Multimodal": ["blip", "flamingo", "kosmos", "imagebind", "video-llava", "audioclip", "text-to-image", "text-to-video"],
  "Architectures": ["transformer", "mamba", "moe", "state-space-models", "cnn", "rnn", "lstm", "gcn", "big-bird", "graph-neural-networks"],
  "Evaluation": ["pass-1", "llm-as-a-judge", "human-eval", "perplexity", "f1-score", "exact-match", "auc", "meteor"],
  "Embeddings": ["word2vec", "glove", "elmo", "bert-embedding", "sentence-transformer", "openai-embedding", "cohere-embedding", "embedding-models", "dense-embedding", "embedding"]
};

async function seedCategories() {
  console.log("Starting categorization seed...");
  let updatedCount = 0;

  for (const [category, slugs] of Object.entries(CATEGORY_MAP)) {
    for (const slug of slugs) {
      try {
        // We find the method first to see if it exists
        const method = await prisma.method.findUnique({ where: { slug } });
        if (method) {
          await prisma.method.update({
            where: { slug },
            data: { category }
          });
          console.log(`✅ Assigned '${category}' to ${method.name}`);
          updatedCount++;
        }
      } catch (error) {
        // Ignore if not found
      }
    }
  }

  // Also catch variations (like spaces instead of dashes)
  const allMethods = await prisma.method.findMany({
      where: { category: null }
  });
  
  for (const method of allMethods) {
      const lowerName = method.name.toLowerCase();
      let matchedCategory = null;
      
      for (const [category, slugs] of Object.entries(CATEGORY_MAP)) {
          if (slugs.some(s => lowerName.includes(s.replace(/-/g, ' ')))) {
              matchedCategory = category;
              break;
          }
      }
      
      if (matchedCategory) {
          await prisma.method.update({
              where: { id: method.id },
              data: { category: matchedCategory }
          });
          console.log(`✅ Auto-matched '${matchedCategory}' for ${method.name}`);
          updatedCount++;
      }
  }

  console.log(`\n🎉 Seeding complete! Successfully categorized ${updatedCount} methods.`);
}

seedCategories()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
