# Models Module - Card Membership Audit Report

**Generated**: 2026-10-01T04:13:55.741Z
**Scope**: Comprehensive membership audit for all hub cards, verifying strict taxonomy rules, sample inspection (15 models per card), and zero cross-contamination.

## Executive Summary

| Card Slug | Title | Type | Model Count | Contamination Check | Audit Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `chat` | Chat Models | capability | **364** | Passed (Clean) | ✅ Verified |
| `reasoning` | Reasoning Models | capability | **141** | Passed (Clean) | ✅ Verified |
| `coding` | Coding Models | capability | **41** | Passed (Clean) | ✅ Verified |
| `computer-vision` | Computer Vision | capability | **250** | Passed (Clean) | ✅ Verified |
| `multimodal` | Multimodal Models | capability | **250** | Passed (Clean) | ✅ Verified |
| `agentic-ai` | Agentic AI Models | capability | **129** | Passed (Clean) | ✅ Verified |
| `tool-use` | Tool Use Models | capability | **128** | Passed (Clean) | ✅ Verified |
| `audio` | Audio & Speech | capability | **33** | Passed (Clean) | ✅ Verified |
| `document-ai` | Document AI | capability | **25** | Passed (Clean) | ✅ Verified |
| `robotics` | Robotics & Embodied AI | capability | **15** | Passed (Clean) | ✅ Verified |
| `embeddings` | Embeddings & Search | capability | **15** | Passed (Clean) | ✅ Verified |
| `mathematics` | Mathematics | capability | **139** | Passed (Clean) | ✅ Verified |
| `translation` | Translation | capability | **16** | Passed (Clean) | ✅ Verified |
| `instruction-following` | Instruction Following | capability | **361** | Passed (Clean) | ✅ Verified |
| `general-purpose` | General Purpose | capability | **364** | Passed (Clean) | ✅ Verified |
| `healthcare` | Healthcare | capability | **3** | Passed (Clean) | ✅ Verified |
| `image-generation` | Image Generation | capability | **26** | Passed (Clean) | ✅ Verified |
| `all` | All Models | curated | **484** | Passed (Clean) | ✅ Verified |
| `open-weights` | Open Weights Models | curated | **210** | Passed (Clean) | ✅ Verified |
| `proprietary` | Proprietary Models | curated | **274** | Passed (Clean) | ✅ Verified |
| `gpt-4` | GPT-4 Family | family | **11** | Passed (Clean) | ✅ Verified |
| `claude-3` | Claude 3 Family | family | **0** | Passed (Clean) | ✅ Verified |
| `llama-3` | Llama 3 Family | family | **1** | Passed (Clean) | ✅ Verified |
| `gemini-1-5` | Gemini 1.5 Family | family | **0** | Passed (Clean) | ✅ Verified |
| `deepseek-v3` | DeepSeek V3 Series | family | **17** | Passed (Clean) | ✅ Verified |
| `qwen-2-5` | Qwen 2.5 Family | family | **0** | Passed (Clean) | ✅ Verified |
| `mistral` | Mistral Series | family | **20** | Passed (Clean) | ✅ Verified |
| `openai` | OpenAI | vendor | **68** | Passed (Clean) | ✅ Verified |
| `anthropic` | Anthropic | vendor | **15** | Passed (Clean) | ✅ Verified |
| `meta` | Meta | vendor | **6** | Passed (Clean) | ✅ Verified |
| `google` | Google | vendor | **30** | Passed (Clean) | ✅ Verified |
| `deepseek` | DeepSeek | vendor | **14** | Passed (Clean) | ✅ Verified |
| `alibaba` | Alibaba Cloud / Qwen | vendor | **56** | Passed (Clean) | ✅ Verified |
| `mistral-ai` | Mistral AI | vendor | **19** | Passed (Clean) | ✅ Verified |

---

## Detailed Card Sample Inspection (15 Samples per Card)

### `/models/chat` - Chat Models
- **Card Slug**: `chat`
- **Type**: capability
- **Total Canonical Models in Card**: **364**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **TypeSafe: Jev Router** | typesafe | Proprietary | Routing | 10,00,000 tokens | N/A | `general_purpose, chat, instruction_following` |
| 5 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 7 | **Z.ai: GLM 5.3 Prime** | z-ai | Proprietary | General LLM | 10,00,000 tokens | $2.80 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 9 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 10 | **AionLabs: Aion 3.5 Mini** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $0.70 | `general_purpose, chat, instruction_following` |
| 11 | **AionLabs: Aion 3.5** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 12 | **Upstage: Solar Mini 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 13 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 14 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 15 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |

### `/models/reasoning` - Reasoning Models
- **Card Slug**: `reasoning`
- **Type**: capability
- **Total Canonical Models in Card**: **141**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 3 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 4 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 5 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 6 | **OpenAI: GPT-6 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 7 | **Anthropic: Claude Opus 5.5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Omni Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 9 | **PrismML: Ternary Bonsai 2 27B** | prism-ml | Proprietary | Reasoning | 2,62,144 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 10 | **Inception: Mercury 2.5** | inception | Proprietary | Reasoning | 2,60,000 tokens | $0.04 | `general_purpose, chat, instruction_following` |
| 11 | **OpenAI: GPT-6 Astra Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 12 | **Meta: Muse Spark 1.3 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 13 | **Meta: Muse Spark 1.3** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |
| 14 | **Google: Gemini 3.8 Flash** | Google | Proprietary | Reasoning | 10,48,576 tokens | $0.75 | `general_purpose, chat, instruction_following` |
| 15 | **IBM: Granite 4.2 8B** | ibm-granite | Proprietary | Reasoning | 1,31,072 tokens | $0.06 | `general_purpose, chat, instruction_following` |

### `/models/coding` - Coding Models
- **Card Slug**: `coding`
- **Type**: capability
- **Total Canonical Models in Card**: **41**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **SpaceXAI: Grok 4.7** | x-ai | Proprietary | Vision | 5,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6 Astra** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 3 | **Google: Gemini 3.8 Flash** | Google | Proprietary | Reasoning | 10,48,576 tokens | $0.75 | `general_purpose, chat, instruction_following` |
| 4 | **Z.ai: GLM 5.3** | z-ai | Proprietary | Reasoning | 10,48,576 tokens | $1.40 | `general_purpose, chat, instruction_following` |
| 5 | **ByteDance Seed: Seed 2.1 Turbo** | bytedance-seed | Proprietary | Vision | 2,62,144 tokens | $0.50 | `general_purpose, chat, instruction_following` |
| 6 | **ByteDance Seed: Seed-2.0-Code** | bytedance-seed | Proprietary | Vision | 2,62,144 tokens | $0.50 | `general_purpose, chat, instruction_following` |
| 7 | **Anthropic: Claude Opus 5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 8 | **Kwaipilot: KAT-Coder-Pro V2.5** | kwaipilot | Proprietary | Code Generation | 2,62,144 tokens | $0.74 | `general_purpose, chat, instruction_following` |
| 9 | **Z.ai: GLM 5.2** | z-ai | Proprietary | Reasoning | 10,48,576 tokens | $0.41 | `general_purpose, chat, instruction_following` |
| 10 | **MoonshotAI: Kimi K2.7 Code** | moonshotai | Proprietary | Vision | 2,62,144 tokens | $0.67 | `general_purpose, chat, instruction_following` |
| 11 | **SpaceXAI: Grok Build 0.1** | x-ai | Proprietary | Vision | 2,56,000 tokens | $1.00 | `general_purpose, chat, instruction_following` |
| 12 | **Xiaomi: MiMo-V2.5-Pro** | xiaomi | Proprietary | General LLM | 10,50,000 tokens | $0.43 | `general_purpose, chat, instruction_following` |
| 13 | **Pareto Code Router** | openrouter | Proprietary | Code Generation | 20,00,000 tokens | N/A | `general_purpose, chat, instruction_following` |
| 14 | **MoonshotAI: Kimi K2.6** | moonshotai | Proprietary | Vision | 2,62,144 tokens | $0.65 | `general_purpose, chat, instruction_following` |
| 15 | **OpenAI: GPT-5.3-Codex** | OpenAI | Proprietary | Reasoning | 4,00,000 tokens | $1.75 | `general_purpose, chat, instruction_following` |

### `/models/computer-vision` - Computer Vision
- **Card Slug**: `computer-vision`
- **Type**: capability
- **Total Canonical Models in Card**: **250**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 5 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 6 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 7 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 8 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 9 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 10 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 11 | **OpenAI: GPT-6 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 12 | **OpenAI: GPT-6 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 13 | **Anthropic: Claude Opus 5.5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 14 | **Xiaomi: MiMo-V2.6-Pro-UltraSpeed** | xiaomi | Proprietary | Vision | 10,48,576 tokens | $4.35 | `general_purpose, chat, instruction_following` |
| 15 | **Xiaomi: MiMo-V2.6-Flash** | xiaomi | Proprietary | Vision | 10,50,000 tokens | $0.14 | `general_purpose, chat, instruction_following` |

### `/models/multimodal` - Multimodal Models
- **Card Slug**: `multimodal`
- **Type**: capability
- **Total Canonical Models in Card**: **250**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **TypeSafe: Jev Router** | typesafe | Proprietary | Routing | 10,00,000 tokens | N/A | `general_purpose, chat, instruction_following` |
| 5 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 7 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 8 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 9 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 10 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 11 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 12 | **OpenAI: GPT-6 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 13 | **OpenAI: GPT-6 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 14 | **Anthropic: Claude Opus 5.5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 15 | **Xiaomi: MiMo-V2.6-Pro-UltraSpeed** | xiaomi | Proprietary | Vision | 10,48,576 tokens | $4.35 | `general_purpose, chat, instruction_following` |

### `/models/agentic-ai` - Agentic AI Models
- **Card Slug**: `agentic-ai`
- **Type**: capability
- **Total Canonical Models in Card**: **129**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 3 | **Upstage: Solar Mini 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 4 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 5 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 6 | **Anthropic: Claude Opus 5.5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 7 | **SpaceXAI: Grok 4.7** | x-ai | Proprietary | Vision | 5,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Omni Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 9 | **PrismML: Ternary Bonsai 2 27B** | prism-ml | Proprietary | Reasoning | 2,62,144 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 10 | **Pareto** | unbiased | Proprietary | Vision | 2,62,144 tokens | $2.50 | `general_purpose, chat, instruction_following` |
| 11 | **Sakana: Fugu Ultra v2** | sakana | Proprietary | Vision | 10,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 12 | **Sakana: Fugu Max** | sakana | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 13 | **Nex AGI: Nex-N2.5-Mini** | nex-agi | Proprietary | Vision | 2,62,144 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 14 | **Nex AGI: Nex-N2.5-Pro** | nex-agi | Proprietary | Vision | 2,62,144 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 15 | **Meta: Muse Spark 1.3 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |

### `/models/tool-use` - Tool Use Models
- **Card Slug**: `tool-use`
- **Type**: capability
- **Total Canonical Models in Card**: **128**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 3 | **Upstage: Solar Mini 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 4 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 5 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 6 | **Anthropic: Claude Opus 5.5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 7 | **SpaceXAI: Grok 4.7** | x-ai | Proprietary | Vision | 5,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Omni Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 9 | **PrismML: Ternary Bonsai 2 27B** | prism-ml | Proprietary | Reasoning | 2,62,144 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 10 | **Pareto** | unbiased | Proprietary | Vision | 2,62,144 tokens | $2.50 | `general_purpose, chat, instruction_following` |
| 11 | **Sakana: Fugu Ultra v2** | sakana | Proprietary | Vision | 10,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 12 | **Sakana: Fugu Max** | sakana | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 13 | **Nex AGI: Nex-N2.5-Mini** | nex-agi | Proprietary | Vision | 2,62,144 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 14 | **Nex AGI: Nex-N2.5-Pro** | nex-agi | Proprietary | Vision | 2,62,144 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 15 | **Meta: Muse Spark 1.3 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |

### `/models/audio` - Audio & Speech
- **Card Slug**: `audio`
- **Type**: capability
- **Total Canonical Models in Card**: **33**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT Audio** | OpenAI | Proprietary | Code Generation | 1,28,000 tokens | $2.50 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT Audio Mini** | OpenAI | Proprietary | Code Generation | 1,28,000 tokens | $0.60 | `general_purpose, chat, instruction_following` |
| 3 | **Mistral: Voxtral Small 24B 2507** | Mistral AI | Open Weights | Audio | 32,768 tokens | $0.10 | `audio, speech` |
| 4 | **Kokoro-82M-v1.0-ONNX** | onnx-community | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 5 | **VoxCPM2** | openbmb | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 6 | **kokoro-inno-clone-tuner** | remsky | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 7 | **VieNeu-TTS-v3-Turbo** | pnnbao-ump | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 8 | **VibeVoice-1.5B** | Microsoft | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 9 | **F5-TTS** | SWivid | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 10 | **Qwen3-TTS-12Hz-0.6B-Base** | Alibaba | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 11 | **sanoTTS** | ampixa | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 12 | **whisper-small** | OpenAI | Proprietary | Audio | N/A | N/A | `audio, speech` |
| 13 | **wav2vec2-indonesian-javanese-sundanese** | indonesian-nlp | Open Weights | Audio | N/A | N/A | `audio, speech` |
| 14 | **whisper-large-v3** | OpenAI | Proprietary | Audio | N/A | N/A | `audio, speech` |
| 15 | **XTTS-v2** | coqui | Open Weights | Audio | N/A | N/A | `audio, speech` |

### `/models/document-ai` - Document AI
- **Card Slug**: `document-ai`
- **Type**: capability
- **Total Canonical Models in Card**: **25**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6 Astra** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 3 | **Qwen: Qwen3.8 Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 4 | **Upstage: Solar Pro 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.09 | `general_purpose, chat, instruction_following` |
| 5 | **Meta: Muse Spark 1.2** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |
| 6 | **Meta: Muse Spark 1.1** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |
| 7 | **Google: Gemini 3.1 Flash Lite** | Google | Proprietary | Vision | 10,48,576 tokens | $0.25 | `general_purpose, chat, instruction_following` |
| 8 | **Z.ai: GLM 4.6V** | z-ai | Proprietary | Reasoning | 1,31,072 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 9 | **Qwen: Qwen3 VL 8B Thinking** | Alibaba | Open Weights | Reasoning | 1,31,072 tokens | $0.18 | `general_purpose, chat, instruction_following` |
| 10 | **Qwen: Qwen3 VL 235B A22B Instruct** | Alibaba | Open Weights | Vision | 2,62,144 tokens | $0.21 | `general_purpose, chat, instruction_following` |
| 11 | **donut_fine_tuning_food_composition_id** | jonathanjordan21 | Open Weights | Document AI | N/A | N/A | `document_ai, ocr` |
| 12 | **tiny-doc-qa-vision-encoder-decoder** | optimum-intel-internal-testing | Open Weights | Document AI | N/A | N/A | `document_ai, ocr` |
| 13 | **layoutlm-invoices** | DmitrySpartak | Open Weights | Document AI | N/A | N/A | `document_ai, ocr` |
| 14 | **layoutlmv3_docvqa_t11c5000** | xhyi | Open Weights | Document AI | N/A | N/A | `document_ai, ocr` |
| 15 | **OCR-DocVQA-Donut** | jinhybr | Open Weights | Document AI | N/A | N/A | `document_ai, ocr` |

### `/models/robotics` - Robotics & Embodied AI
- **Card Slug**: `robotics`
- **Type**: capability
- **Total Canonical Models in Card**: **15**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **JiRackPrecisionTokenizer** | CMSManhattan | Open Weights | Robotics | N/A | N/A | `robotics` |
| 2 | **GR00T-N1.6-3B** | nvidia | Open Weights | Robotics | N/A | N/A | `robotics` |
| 3 | **pi05_libero_finetuned_v044** | lerobot | Open Weights | Robotics | N/A | N/A | `robotics` |
| 4 | **X-VLA-Pt** | 2toINF | Open Weights | Robotics | N/A | N/A | `robotics` |
| 5 | **smolvla_libero** | lerobot | Open Weights | Robotics | N/A | N/A | `robotics` |
| 6 | **openvla-7b** | openvla | Open Weights | Robotics | N/A | N/A | `robotics` |
| 7 | **GR00T-N1.7-3B** | nvidia | Open Weights | Robotics | N/A | N/A | `robotics` |
| 8 | **MolmoAct2** | allenai | Open Weights | Robotics | N/A | N/A | `robotics` |
| 9 | **smolvla_libero** | HuggingFaceVLA | Open Weights | Robotics | N/A | N/A | `robotics` |
| 10 | **smolvla_base** | lerobot | Open Weights | Robotics | N/A | N/A | `robotics` |
| 11 | **pi05_base** | lerobot | Open Weights | Robotics | N/A | N/A | `robotics` |
| 12 | **openvla-7b-oft-finetuned-libero-spatial** | moojink | Open Weights | Robotics | N/A | N/A | `robotics` |
| 13 | **libero4in1_wan2.2vae_latent_cosmos_style** | MangoGoes | Open Weights | Robotics | N/A | N/A | `robotics` |
| 14 | **pi0_base** | lerobot | Open Weights | Robotics | N/A | N/A | `robotics` |
| 15 | **Alpamayo-1.5-10B** | nvidia | Open Weights | Robotics | N/A | N/A | `robotics` |

### `/models/embeddings` - Embeddings & Search
- **Card Slug**: `embeddings`
- **Type**: capability
- **Total Canonical Models in Card**: **15**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **all-distilroberta-v1** | sentence-transformers | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 2 | **paraphrase-mpnet-base-v2** | sentence-transformers | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 3 | **stsb-bert-tiny-safetensors** | sentence-transformers-testing | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 4 | **bge-base-en-v1.5-course-recommender-v5** | datasocietyco | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 5 | **nomic-embed-text-v1.5** | nomic-ai | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 6 | **multilingual-e5-small** | intfloat | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 7 | **multilingual-e5-base** | intfloat | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 8 | **paraphrase-multilingual-MiniLM-L12-v2** | sentence-transformers | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 9 | **nomic-embed-text-v1** | nomic-ai | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 10 | **bge-m3** | BAAI | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 11 | **embeddinggemma-300m** | Google | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 12 | **paraphrase-multilingual-mpnet-base-v2** | sentence-transformers | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 13 | **all-MiniLM-L6-v2** | sentence-transformers | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 14 | **all-mpnet-base-v2** | sentence-transformers | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |
| 15 | **all-MiniLM-L12-v2** | sentence-transformers | Open Weights | Embeddings | N/A | N/A | `embeddings, search` |

### `/models/mathematics` - Mathematics
- **Card Slug**: `mathematics`
- **Type**: capability
- **Total Canonical Models in Card**: **139**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 3 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 4 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 5 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 6 | **OpenAI: GPT-6 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 7 | **Anthropic: Claude Opus 5.5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Omni Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 9 | **PrismML: Ternary Bonsai 2 27B** | prism-ml | Proprietary | Reasoning | 2,62,144 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 10 | **Inception: Mercury 2.5** | inception | Proprietary | Reasoning | 2,60,000 tokens | $0.04 | `general_purpose, chat, instruction_following` |
| 11 | **OpenAI: GPT-6 Astra Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 12 | **Meta: Muse Spark 1.3 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 13 | **Meta: Muse Spark 1.3** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |
| 14 | **Google: Gemini 3.8 Flash** | Google | Proprietary | Reasoning | 10,48,576 tokens | $0.75 | `general_purpose, chat, instruction_following` |
| 15 | **IBM: Granite 4.2 8B** | ibm-granite | Proprietary | Reasoning | 1,31,072 tokens | $0.06 | `general_purpose, chat, instruction_following` |

### `/models/translation` - Translation
- **Card Slug**: `translation`
- **Type**: capability
- **Total Canonical Models in Card**: **16**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **IBM: Granite 4.2 8B** | ibm-granite | Proprietary | Reasoning | 1,31,072 tokens | $0.06 | `general_purpose, chat, instruction_following` |
| 2 | **Tencent: Hy-MT2-1.8B** | tencent | Proprietary | General LLM | 8,192 tokens | $0.04 | `general_purpose, chat, instruction_following` |
| 3 | **Tencent: Hy-MT2-30B-A3B** | tencent | Proprietary | General LLM | 8,192 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 4 | **Tencent: Hy-MT2-7B** | tencent | Proprietary | General LLM | 8,192 tokens | $0.07 | `general_purpose, chat, instruction_following` |
| 5 | **ByteDance Seed: Seed-2.0-Code** | bytedance-seed | Proprietary | Vision | 2,62,144 tokens | $0.50 | `general_purpose, chat, instruction_following` |
| 6 | **Qwen: Qwen3 Max** | Alibaba | Proprietary | Reasoning | 2,62,144 tokens | $0.78 | `general_purpose, chat, instruction_following` |
| 7 | **Qwen: Qwen3 Next 80B A3B Instruct** | Alibaba | Open Weights | Reasoning | 2,62,144 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3 30B A3B Instruct 2507** | Alibaba | Open Weights | General LLM | 2,62,144 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 9 | **Qwen: Qwen3 235B A22B Instruct 2507** | Alibaba | Open Weights | General LLM | 2,62,144 tokens | $0.09 | `general_purpose, chat, instruction_following` |
| 10 | **Qwen: Qwen3 30B A3B** | Alibaba | Open Weights | Reasoning | 1,31,072 tokens | $0.12 | `general_purpose, chat, instruction_following` |
| 11 | **Cohere: Command A** | Cohere | Proprietary | General LLM | 2,56,000 tokens | $2.50 | `general_purpose, chat, instruction_following` |
| 12 | **Meta: Llama 3.3 70B Instruct** | meta-llama | Open Weights | General LLM | 1,31,072 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 13 | **Meta: Llama 3.2 3B Instruct** | meta-llama | Open Weights | Reasoning | 1,31,072 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 14 | **Meta: Llama 3.2 1B Instruct** | meta-llama | Open Weights | General LLM | 60,000 tokens | $0.03 | `general_purpose, chat, instruction_following` |
| 15 | **Cohere: Command R (08-2024)** | Cohere | Proprietary | Reasoning | 1,28,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |

### `/models/instruction-following` - Instruction Following
- **Card Slug**: `instruction-following`
- **Type**: capability
- **Total Canonical Models in Card**: **361**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **TypeSafe: Jev Router** | typesafe | Proprietary | Routing | 10,00,000 tokens | N/A | `general_purpose, chat, instruction_following` |
| 5 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 7 | **Z.ai: GLM 5.3 Prime** | z-ai | Proprietary | General LLM | 10,00,000 tokens | $2.80 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 9 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 10 | **AionLabs: Aion 3.5 Mini** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $0.70 | `general_purpose, chat, instruction_following` |
| 11 | **AionLabs: Aion 3.5** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 12 | **Upstage: Solar Mini 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 13 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 14 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 15 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |

### `/models/general-purpose` - General Purpose
- **Card Slug**: `general-purpose`
- **Type**: capability
- **Total Canonical Models in Card**: **364**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **TypeSafe: Jev Router** | typesafe | Proprietary | Routing | 10,00,000 tokens | N/A | `general_purpose, chat, instruction_following` |
| 5 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 7 | **Z.ai: GLM 5.3 Prime** | z-ai | Proprietary | General LLM | 10,00,000 tokens | $2.80 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 9 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 10 | **AionLabs: Aion 3.5 Mini** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $0.70 | `general_purpose, chat, instruction_following` |
| 11 | **AionLabs: Aion 3.5** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 12 | **Upstage: Solar Mini 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 13 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 14 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 15 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |

### `/models/healthcare` - Healthcare
- **Card Slug**: `healthcare`
- **Type**: capability
- **Total Canonical Models in Card**: **3**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Mistral: Mistral Medium 3.5** | Mistral AI | Proprietary | Vision | 2,62,144 tokens | $1.50 | `general_purpose, chat, instruction_following` |
| 2 | **Mistral: Mistral Medium 3.1** | Mistral AI | Proprietary | Vision | 1,31,072 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 3 | **Mistral: Mistral Medium 3** | Mistral AI | Proprietary | Reasoning | 1,31,072 tokens | $0.40 | `general_purpose, chat, instruction_following` |

### `/models/image-generation` - Image Generation
- **Card Slug**: `image-generation`
- **Type**: capability
- **Total Canonical Models in Card**: **26**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Auto Router (Beta)** | openrouter | Proprietary | Routing | 20,00,000 tokens | N/A | `image_generation, computer_vision, multimodal` |
| 2 | **Google: Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image)** | Google | Proprietary | Vision | 65,536 tokens | $0.25 | `image_generation, computer_vision, multimodal` |
| 3 | **Google: Nano Banana 2 (Gemini 3.1 Flash Image)** | Google | Proprietary | Vision | 1,31,072 tokens | $0.50 | `image_generation, computer_vision, multimodal` |
| 4 | **Google: Nano Banana Pro (Gemini 3 Pro Image)** | Google | Proprietary | Vision | 1,31,072 tokens | $2.00 | `image_generation, computer_vision, multimodal` |
| 5 | **OpenAI: GPT-5.4 Image 2** | OpenAI | Proprietary | Vision | 2,72,000 tokens | $8.00 | `image_generation, computer_vision, multimodal` |
| 6 | **Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview)** | Google | Proprietary | Vision | 65,536 tokens | $0.50 | `image_generation, computer_vision, multimodal` |
| 7 | **Google: Nano Banana Pro (Gemini 3 Pro Image Preview)** | Google | Proprietary | Vision | 65,536 tokens | $2.00 | `image_generation, computer_vision, multimodal` |
| 8 | **OpenAI: GPT-5 Image Mini** | OpenAI | Proprietary | Vision | 4,00,000 tokens | $2.50 | `image_generation, computer_vision, multimodal` |
| 9 | **OpenAI: GPT-5 Image** | OpenAI | Proprietary | Vision | 4,00,000 tokens | $10.00 | `image_generation, computer_vision, multimodal` |
| 10 | **Google: Nano Banana (Gemini 2.5 Flash Image)** | Google | Proprietary | Vision | 32,768 tokens | $0.30 | `image_generation, computer_vision, multimodal` |
| 11 | **Auto Router** | openrouter | Proprietary | Routing | 20,00,000 tokens | N/A | `image_generation, computer_vision, multimodal` |
| 12 | **sd-turbo** | stabilityai | Open Weights | Vision | N/A | N/A | `image_generation, computer_vision` |
| 13 | **RealVisXL_V5.0** | SG161222 | Open Weights | Vision | N/A | N/A | `image_generation, computer_vision` |
| 14 | **stable-diffusion-v1-5** | stable-diffusion-v1-5 | Open Weights | Vision | N/A | N/A | `image_generation, computer_vision` |
| 15 | **sdxl-turbo** | stabilityai | Open Weights | Vision | N/A | N/A | `image_generation, computer_vision` |

### `/models/all` - All Models
- **Card Slug**: `all`
- **Type**: curated
- **Total Canonical Models in Card**: **484**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **TypeSafe: Jev Router** | typesafe | Proprietary | Routing | 10,00,000 tokens | N/A | `general_purpose, chat, instruction_following` |
| 5 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 7 | **Z.ai: GLM 5.3 Prime** | z-ai | Proprietary | General LLM | 10,00,000 tokens | $2.80 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 9 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 10 | **AionLabs: Aion 3.5 Mini** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $0.70 | `general_purpose, chat, instruction_following` |
| 11 | **AionLabs: Aion 3.5** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 12 | **Upstage: Solar Mini 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 13 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 14 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 15 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |

### `/models/open-weights` - Open Weights Models
- **Card Slug**: `open-weights`
- **Type**: curated
- **Total Canonical Models in Card**: **210**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Qwen: Qwen3.8 Omni Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 2 | **DeepSeek: DeepSeek Pro Latest** | ~deepseek | Open Weights | General LLM | 10,48,576 tokens | $0.12 | `general_purpose, chat, instruction_following` |
| 3 | **DeepSeek: DeepSeek Flash Latest** | ~deepseek | Open Weights | Vision | 10,48,576 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 4 | **DeepSeek: DeepSeek V4.1 Flash** | DeepSeek | Open Weights | Vision | 10,48,576 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 5 | **Meta: Muse Spark 1.3 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 6 | **Meta: Muse Spark 1.3** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |
| 7 | **Qwen: Qwen3.8 Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 8 | **Meta: Muse Spark 1.2 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 9 | **DeepSeek: DeepSeek V4 Flash Vision Exp** | DeepSeek | Open Weights | Vision | 10,48,576 tokens | $0.22 | `general_purpose, chat, instruction_following` |
| 10 | **Qwen: Qwen3.8 27B** | Alibaba | Open Weights | Vision | 10,00,000 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 11 | **Qwen: Qwen3.8 2.4T A95B** | Alibaba | Open Weights | General LLM | 10,48,576 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 12 | **DeepSeek: DeepSeek V4 Pro 0813** | DeepSeek | Open Weights | General LLM | 10,48,576 tokens | $0.66 | `general_purpose, chat, instruction_following` |
| 13 | **NVIDIA: Nemotron 3.5 Lightning** | nvidia | Open Weights | General LLM | 2,62,144 tokens | $0.06 | `general_purpose, chat, instruction_following` |
| 14 | **Meta: Muse Glimmer 30B** | Meta | Open Weights | Vision | 1,31,072 tokens | $0.35 | `general_purpose, chat, instruction_following` |
| 15 | **Meta: Muse Spark 1.2** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |

### `/models/proprietary` - Proprietary Models
- **Card Slug**: `proprietary`
- **Type**: curated
- **Total Canonical Models in Card**: **274**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **TypeSafe: Jev Router** | typesafe | Proprietary | Routing | 10,00,000 tokens | N/A | `general_purpose, chat, instruction_following` |
| 5 | **Perceptron: Perceptron Mk1.5** | perceptron | Proprietary | Reasoning | 36,864 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Fireworks: Ember-1** | fireworks | Proprietary | Reasoning | 10,48,576 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 7 | **Z.ai: GLM 5.3 Prime** | z-ai | Proprietary | General LLM | 10,00,000 tokens | $2.80 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 9 | **Space Bunny Alpha** | stealth | Proprietary | Reasoning | 10,00,000 tokens | Free | `general_purpose, chat, instruction_following` |
| 10 | **AionLabs: Aion 3.5 Mini** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $0.70 | `general_purpose, chat, instruction_following` |
| 11 | **AionLabs: Aion 3.5** | aion-labs | Proprietary | General LLM | 2,62,144 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 12 | **Upstage: Solar Mini 4** | upstage | Proprietary | General LLM | 5,24,288 tokens | $0.05 | `general_purpose, chat, instruction_following` |
| 13 | **Cohere: Command A+** | Cohere | Proprietary | Vision | 1,92,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 14 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 15 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |

### `/models/gpt-4` - GPT-4 Family
- **Card Slug**: `gpt-4`
- **Type**: family
- **Total Canonical Models in Card**: **11**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-4.1** | OpenAI | Proprietary | Reasoning | 10,47,576 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-4.1 Mini** | OpenAI | Proprietary | Vision | 10,47,576 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 3 | **OpenAI: GPT-4.1 Nano** | OpenAI | Proprietary | Vision | 10,47,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 4 | **OpenAI: GPT-4o (2024-11-20)** | OpenAI | Proprietary | Vision | 1,28,000 tokens | $2.50 | `general_purpose, chat, instruction_following` |
| 5 | **OpenAI: GPT-4o (2024-08-06)** | OpenAI | Proprietary | Vision | 1,28,000 tokens | $2.50 | `general_purpose, chat, instruction_following` |
| 6 | **OpenAI: GPT-4o-mini (2024-07-18)** | OpenAI | Proprietary | Vision | 1,28,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 7 | **OpenAI: GPT-4o-mini** | OpenAI | Proprietary | Vision | 1,28,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 8 | **OpenAI: GPT-4o (2024-05-13)** | OpenAI | Proprietary | Vision | 1,28,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 9 | **OpenAI: GPT-4o** | OpenAI | Proprietary | Vision | 1,28,000 tokens | $2.50 | `general_purpose, chat, instruction_following` |
| 10 | **OpenAI: GPT-4 Turbo** | OpenAI | Proprietary | Vision | 1,28,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 11 | **OpenAI: GPT-4** | OpenAI | Proprietary | Reasoning | 8,191 tokens | $30.00 | `general_purpose, chat, instruction_following` |

### `/models/claude-3` - Claude 3 Family
- **Card Slug**: `claude-3`
- **Type**: family
- **Total Canonical Models in Card**: **0**
- **Contamination Status**: Passed (Clean)

*No models found for this card contract.*

### `/models/llama-3` - Llama 3 Family
- **Card Slug**: `llama-3`
- **Type**: family
- **Total Canonical Models in Card**: **1**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Llama-3.1-PersianQA** | zpm | Open Weights | Document AI | N/A | N/A | `document_ai, ocr` |

### `/models/gemini-1-5` - Gemini 1.5 Family
- **Card Slug**: `gemini-1-5`
- **Type**: family
- **Total Canonical Models in Card**: **0**
- **Contamination Status**: Passed (Clean)

*No models found for this card contract.*

### `/models/deepseek-v3` - DeepSeek V3 Series
- **Card Slug**: `deepseek-v3`
- **Type**: family
- **Total Canonical Models in Card**: **17**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **DeepSeek: DeepSeek Pro Latest** | ~deepseek | Open Weights | General LLM | 10,48,576 tokens | $0.12 | `general_purpose, chat, instruction_following` |
| 2 | **DeepSeek: DeepSeek Flash Latest** | ~deepseek | Open Weights | Vision | 10,48,576 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 3 | **DeepSeek: DeepSeek V4.1 Flash** | DeepSeek | Open Weights | Vision | 10,48,576 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 4 | **DeepSeek: DeepSeek V4 Flash Vision Exp** | DeepSeek | Open Weights | Vision | 10,48,576 tokens | $0.22 | `general_purpose, chat, instruction_following` |
| 5 | **DeepSeek: DeepSeek V4 Pro 0813** | DeepSeek | Open Weights | General LLM | 10,48,576 tokens | $0.66 | `general_purpose, chat, instruction_following` |
| 6 | **DeepSeek: DeepSeek V4 Flash Latest** | ~deepseek | Open Weights | General LLM | 10,48,576 tokens | $0.01 | `general_purpose, chat, instruction_following` |
| 7 | **DeepSeek: DeepSeek V4 Flash 0731** | DeepSeek | Open Weights | Reasoning | 10,48,576 tokens | $0.01 | `general_purpose, chat, instruction_following` |
| 8 | **DeepSeek: DeepSeek V4 Pro 0423** | DeepSeek | Open Weights | Reasoning | 10,48,576 tokens | $0.78 | `general_purpose, chat, instruction_following` |
| 9 | **DeepSeek: DeepSeek V4 Flash 0423** | DeepSeek | Open Weights | General LLM | 10,48,576 tokens | $0.08 | `general_purpose, chat, instruction_following` |
| 10 | **DeepSeek: DeepSeek V3.2** | DeepSeek | Open Weights | Reasoning | 1,63,840 tokens | $0.28 | `general_purpose, chat, instruction_following` |
| 11 | **DeepSeek: DeepSeek V3.2 Exp** | DeepSeek | Open Weights | General LLM | 1,63,840 tokens | $0.27 | `general_purpose, chat, instruction_following` |
| 12 | **DeepSeek: DeepSeek V3.1 Terminus** | DeepSeek | Open Weights | General LLM | 1,63,840 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 13 | **DeepSeek: DeepSeek V3.1** | DeepSeek | Open Weights | Reasoning | 1,63,840 tokens | $0.25 | `general_purpose, chat, instruction_following` |
| 14 | **DeepSeek: R1 0528** | DeepSeek | Open Weights | Reasoning | 1,63,840 tokens | $0.50 | `general_purpose, chat, instruction_following` |
| 15 | **DeepSeek: DeepSeek V3 0324** | DeepSeek | Open Weights | General LLM | 1,63,840 tokens | $0.29 | `general_purpose, chat, instruction_following` |

### `/models/qwen-2-5` - Qwen 2.5 Family
- **Card Slug**: `qwen-2-5`
- **Type**: family
- **Total Canonical Models in Card**: **0**
- **Contamination Status**: Passed (Clean)

*No models found for this card contract.*

### `/models/mistral` - Mistral Series
- **Card Slug**: `mistral`
- **Type**: family
- **Total Canonical Models in Card**: **20**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Mistral: Mistral Medium 3.5** | Mistral AI | Proprietary | Vision | 2,62,144 tokens | $1.50 | `general_purpose, chat, instruction_following` |
| 2 | **Mistral: Mistral Small 4** | Mistral AI | Open Weights | Reasoning | 2,62,144 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 3 | **Mistral: Devstral 2 2512** | Mistral AI | Open Weights | General LLM | 2,62,144 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 4 | **Mistral: Ministral 3 14B 2512** | Mistral AI | Open Weights | Vision | 2,62,144 tokens | $0.20 | `general_purpose, chat, instruction_following` |
| 5 | **Mistral: Ministral 3 8B 2512** | Mistral AI | Open Weights | Vision | 2,62,144 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Mistral: Ministral 3 3B 2512** | Mistral AI | Open Weights | Vision | 1,31,072 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 7 | **Mistral: Mistral Large 3 2512** | Mistral AI | Proprietary | Vision | 2,62,144 tokens | $0.50 | `general_purpose, chat, instruction_following` |
| 8 | **Mistral: Voxtral Small 24B 2507** | Mistral AI | Open Weights | Audio | 32,768 tokens | $0.10 | `audio, speech` |
| 9 | **Mistral: Mistral Medium 3.1** | Mistral AI | Proprietary | Vision | 1,31,072 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 10 | **Mistral: Codestral 2508** | Mistral AI | Open Weights | Code Generation | 2,56,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 11 | **Venice: Uncensored** | cognitivecomputations | Open Weights | General LLM | 1,28,000 tokens | $0.20 | `general_purpose, chat, instruction_following` |
| 12 | **Mistral: Mistral Small 3.2 24B** | Mistral AI | Open Weights | Vision | 2,56,000 tokens | $0.09 | `general_purpose, chat, instruction_following` |
| 13 | **Mistral: Mistral Medium 3** | Mistral AI | Proprietary | Reasoning | 1,31,072 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 14 | **Mistral: Mistral Small 3.1 24B** | Mistral AI | Open Weights | Reasoning | 1,28,000 tokens | $0.35 | `general_purpose, chat, instruction_following` |
| 15 | **Mistral: Saba** | Mistral AI | Open Weights | General LLM | 32,768 tokens | $0.20 | `general_purpose, chat, instruction_following` |

### `/models/openai` - OpenAI
- **Card Slug**: `openai`
- **Type**: vendor
- **Total Canonical Models in Card**: **68**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **OpenAI: GPT-6.1 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **OpenAI: GPT-6.1 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 3 | **OpenAI: GPT-6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 4 | **OpenAI: GPT-6 Luna** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 5 | **OpenAI: GPT-6 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 6 | **OpenAI: GPT-6 Sol** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 7 | **OpenAI: GPT-6 Astra** | OpenAI | Proprietary | Vision | 10,50,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 8 | **OpenAI: GPT-6 Astra Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 9 | **OpenAI: GPT-5.6 Luna Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.20 | `general_purpose, chat, instruction_following` |
| 10 | **OpenAI: GPT-5.6 Luna** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $0.20 | `general_purpose, chat, instruction_following` |
| 11 | **OpenAI: GPT-5.6 Terra Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 12 | **OpenAI: GPT-5.6 Terra** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 13 | **OpenAI: GPT-5.6 Sol Pro** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 14 | **OpenAI: GPT-5.6 Sol** | OpenAI | Proprietary | Reasoning | 10,50,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 15 | **OpenAI: GPT Chat Latest** | OpenAI | Proprietary | Vision | 4,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |

### `/models/anthropic` - Anthropic
- **Card Slug**: `anthropic`
- **Type**: vendor
- **Total Canonical Models in Card**: **15**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Anthropic: Claude Sonnet 5.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 2 | **Anthropic: Claude Opus 5.5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 3 | **Anthropic: Claude Fable 5.1** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 4 | **Anthropic: Claude Opus 5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 5 | **Anthropic: Claude Sonnet 5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 6 | **Anthropic: Claude Fable 5** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $10.00 | `general_purpose, chat, instruction_following` |
| 7 | **Anthropic: Claude Opus 4.8** | Anthropic | Proprietary | Reasoning | 10,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 8 | **Anthropic: Claude Opus 4.7** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 9 | **Anthropic: Claude Sonnet 4.6** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 10 | **Anthropic: Claude Opus 4.6** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 11 | **Anthropic: Claude Opus 4.5** | Anthropic | Proprietary | Reasoning | 2,00,000 tokens | $5.00 | `general_purpose, chat, instruction_following` |
| 12 | **Anthropic: Claude Haiku 4.5** | Anthropic | Proprietary | Vision | 2,00,000 tokens | $1.00 | `general_purpose, chat, instruction_following` |
| 13 | **Anthropic: Claude Sonnet 4.5** | Anthropic | Proprietary | Vision | 10,00,000 tokens | $3.00 | `general_purpose, chat, instruction_following` |
| 14 | **Anthropic: Claude Opus 4.1** | Anthropic | Proprietary | Reasoning | 2,00,000 tokens | $15.00 | `general_purpose, chat, instruction_following` |
| 15 | **Anthropic: Claude Sonnet 4** | Anthropic | Proprietary | Reasoning | 2,00,000 tokens | $3.00 | `general_purpose, chat, instruction_following` |

### `/models/meta` - Meta
- **Card Slug**: `meta`
- **Type**: vendor
- **Total Canonical Models in Card**: **6**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Meta: Muse Spark 1.3 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 2 | **Meta: Muse Spark 1.3** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |
| 3 | **Meta: Muse Spark 1.2 Contributor** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 4 | **Meta: Muse Glimmer 30B** | Meta | Open Weights | Vision | 1,31,072 tokens | $0.35 | `general_purpose, chat, instruction_following` |
| 5 | **Meta: Muse Spark 1.2** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |
| 6 | **Meta: Muse Spark 1.1** | Meta | Open Weights | Reasoning | 10,48,576 tokens | $1.25 | `general_purpose, chat, instruction_following` |

### `/models/google` - Google
- **Card Slug**: `google`
- **Type**: vendor
- **Total Canonical Models in Card**: **30**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Google: Gemini 3.8 Flash** | Google | Proprietary | Reasoning | 10,48,576 tokens | $0.75 | `general_purpose, chat, instruction_following` |
| 2 | **Google: Gemini 3.7 Flash** | Google | Proprietary | Reasoning | 10,48,576 tokens | $0.75 | `general_purpose, chat, instruction_following` |
| 3 | **Google: Gemini 3.6 Flash** | Google | Proprietary | Vision | 10,48,576 tokens | $0.75 | `general_purpose, chat, instruction_following` |
| 4 | **Google: Gemini 3.5 Flash Lite** | Google | Proprietary | Vision | 10,48,576 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 5 | **Google: Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image)** | Google | Proprietary | Vision | 65,536 tokens | $0.25 | `image_generation, computer_vision, multimodal` |
| 6 | **Google: Nano Banana 2 (Gemini 3.1 Flash Image)** | Google | Proprietary | Vision | 1,31,072 tokens | $0.50 | `image_generation, computer_vision, multimodal` |
| 7 | **Google: Nano Banana Pro (Gemini 3 Pro Image)** | Google | Proprietary | Vision | 1,31,072 tokens | $2.00 | `image_generation, computer_vision, multimodal` |
| 8 | **Google: Gemini 3.5 Flash** | Google | Proprietary | Reasoning | 10,48,576 tokens | $1.50 | `general_purpose, chat, instruction_following` |
| 9 | **Google: Gemini 3.1 Flash Lite** | Google | Proprietary | Vision | 10,48,576 tokens | $0.25 | `general_purpose, chat, instruction_following` |
| 10 | **Google: Gemma 4 26B A4B ** | Google | Open Weights | Vision | 2,62,144 tokens | $0.09 | `general_purpose, chat, instruction_following` |
| 11 | **Google: Gemma 4 31B** | Google | Open Weights | Reasoning | 2,62,144 tokens | $0.09 | `general_purpose, chat, instruction_following` |
| 12 | **Google: Lyria 3 Pro Preview** | Google | Proprietary | Vision | 10,48,576 tokens | Free | `general_purpose, chat, instruction_following` |
| 13 | **Google: Lyria 3 Clip Preview** | Google | Proprietary | Vision | 10,48,576 tokens | Free | `general_purpose, chat, instruction_following` |
| 14 | **Google: Gemini 3.1 Flash Lite Preview** | Google | Proprietary | Vision | 10,48,576 tokens | $0.25 | `general_purpose, chat, instruction_following` |
| 15 | **Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview)** | Google | Proprietary | Vision | 65,536 tokens | $0.50 | `image_generation, computer_vision, multimodal` |

### `/models/deepseek` - DeepSeek
- **Card Slug**: `deepseek`
- **Type**: vendor
- **Total Canonical Models in Card**: **14**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **DeepSeek: DeepSeek V4.1 Flash** | DeepSeek | Open Weights | Vision | 10,48,576 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 2 | **DeepSeek: DeepSeek V4 Flash Vision Exp** | DeepSeek | Open Weights | Vision | 10,48,576 tokens | $0.22 | `general_purpose, chat, instruction_following` |
| 3 | **DeepSeek: DeepSeek V4 Pro 0813** | DeepSeek | Open Weights | General LLM | 10,48,576 tokens | $0.66 | `general_purpose, chat, instruction_following` |
| 4 | **DeepSeek: DeepSeek V4 Flash 0731** | DeepSeek | Open Weights | Reasoning | 10,48,576 tokens | $0.01 | `general_purpose, chat, instruction_following` |
| 5 | **DeepSeek: DeepSeek V4 Pro 0423** | DeepSeek | Open Weights | Reasoning | 10,48,576 tokens | $0.78 | `general_purpose, chat, instruction_following` |
| 6 | **DeepSeek: DeepSeek V4 Flash 0423** | DeepSeek | Open Weights | General LLM | 10,48,576 tokens | $0.08 | `general_purpose, chat, instruction_following` |
| 7 | **DeepSeek: DeepSeek V3.2** | DeepSeek | Open Weights | Reasoning | 1,63,840 tokens | $0.28 | `general_purpose, chat, instruction_following` |
| 8 | **DeepSeek: DeepSeek V3.2 Exp** | DeepSeek | Open Weights | General LLM | 1,63,840 tokens | $0.27 | `general_purpose, chat, instruction_following` |
| 9 | **DeepSeek: DeepSeek V3.1 Terminus** | DeepSeek | Open Weights | General LLM | 1,63,840 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 10 | **DeepSeek: DeepSeek V3.1** | DeepSeek | Open Weights | Reasoning | 1,63,840 tokens | $0.25 | `general_purpose, chat, instruction_following` |
| 11 | **DeepSeek: R1 0528** | DeepSeek | Open Weights | Reasoning | 1,63,840 tokens | $0.50 | `general_purpose, chat, instruction_following` |
| 12 | **DeepSeek: DeepSeek V3 0324** | DeepSeek | Open Weights | General LLM | 1,63,840 tokens | $0.29 | `general_purpose, chat, instruction_following` |
| 13 | **DeepSeek: R1** | DeepSeek | Open Weights | Reasoning | 64,000 tokens | $0.70 | `general_purpose, chat, instruction_following` |
| 14 | **DeepSeek: DeepSeek V3** | DeepSeek | Open Weights | General LLM | 1,63,840 tokens | $0.26 | `general_purpose, chat, instruction_following` |

### `/models/alibaba` - Alibaba Cloud / Qwen
- **Card Slug**: `alibaba`
- **Type**: vendor
- **Total Canonical Models in Card**: **56**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Qwen: Qwen3.8 Max Prime** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $4.00 | `general_purpose, chat, instruction_following` |
| 2 | **Qwen: Qwen3.8 Omni Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 3 | **Qwen: Qwen3.8 Max (0902)** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 4 | **Qwen: Qwen3.8 Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 5 | **Qwen: Qwen3.8 27B** | Alibaba | Open Weights | Vision | 10,00,000 tokens | $0.02 | `general_purpose, chat, instruction_following` |
| 6 | **Qwen: Qwen3.8 2.4T A95B** | Alibaba | Open Weights | General LLM | 10,48,576 tokens | $2.00 | `general_purpose, chat, instruction_following` |
| 7 | **Qwen: Qwen3.7 Flash** | Alibaba | Open Weights | Reasoning | 10,00,000 tokens | $0.03 | `general_purpose, chat, instruction_following` |
| 8 | **Qwen: Qwen3.7 Plus** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $0.32 | `general_purpose, chat, instruction_following` |
| 9 | **Qwen: Qwen3.7 Max** | Alibaba | Proprietary | General LLM | 10,00,000 tokens | $1.48 | `general_purpose, chat, instruction_following` |
| 10 | **Qwen: Qwen3.5 Plus 2026-04-20** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 11 | **Qwen: Qwen3.6 Flash** | Alibaba | Open Weights | Vision | 10,00,000 tokens | $0.19 | `general_purpose, chat, instruction_following` |
| 12 | **Qwen: Qwen3.6 35B A3B** | Alibaba | Open Weights | Vision | 2,62,144 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 13 | **Qwen: Qwen3.6 Max Preview** | Alibaba | Proprietary | General LLM | 2,62,144 tokens | $1.03 | `general_purpose, chat, instruction_following` |
| 14 | **Qwen: Qwen3.6 27B** | Alibaba | Open Weights | Vision | 2,62,144 tokens | $0.32 | `general_purpose, chat, instruction_following` |
| 15 | **Qwen: Qwen3.6 Plus** | Alibaba | Proprietary | Vision | 10,00,000 tokens | $0.33 | `general_purpose, chat, instruction_following` |

### `/models/mistral-ai` - Mistral AI
- **Card Slug**: `mistral-ai`
- **Type**: vendor
- **Total Canonical Models in Card**: **19**
- **Contamination Status**: Passed (Clean)

| # | Model Name | Vendor | Openness | Category | Context | Input Price / 1M | Capabilities Preview |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Mistral: Mistral Medium 3.5** | Mistral AI | Proprietary | Vision | 2,62,144 tokens | $1.50 | `general_purpose, chat, instruction_following` |
| 2 | **Mistral: Mistral Small 4** | Mistral AI | Open Weights | Reasoning | 2,62,144 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 3 | **Mistral: Devstral 2 2512** | Mistral AI | Open Weights | General LLM | 2,62,144 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 4 | **Mistral: Ministral 3 14B 2512** | Mistral AI | Open Weights | Vision | 2,62,144 tokens | $0.20 | `general_purpose, chat, instruction_following` |
| 5 | **Mistral: Ministral 3 8B 2512** | Mistral AI | Open Weights | Vision | 2,62,144 tokens | $0.15 | `general_purpose, chat, instruction_following` |
| 6 | **Mistral: Ministral 3 3B 2512** | Mistral AI | Open Weights | Vision | 1,31,072 tokens | $0.10 | `general_purpose, chat, instruction_following` |
| 7 | **Mistral: Mistral Large 3 2512** | Mistral AI | Proprietary | Vision | 2,62,144 tokens | $0.50 | `general_purpose, chat, instruction_following` |
| 8 | **Mistral: Voxtral Small 24B 2507** | Mistral AI | Open Weights | Audio | 32,768 tokens | $0.10 | `audio, speech` |
| 9 | **Mistral: Mistral Medium 3.1** | Mistral AI | Proprietary | Vision | 1,31,072 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 10 | **Mistral: Codestral 2508** | Mistral AI | Open Weights | Code Generation | 2,56,000 tokens | $0.30 | `general_purpose, chat, instruction_following` |
| 11 | **Mistral: Mistral Small 3.2 24B** | Mistral AI | Open Weights | Vision | 2,56,000 tokens | $0.09 | `general_purpose, chat, instruction_following` |
| 12 | **Mistral: Mistral Medium 3** | Mistral AI | Proprietary | Reasoning | 1,31,072 tokens | $0.40 | `general_purpose, chat, instruction_following` |
| 13 | **Mistral: Mistral Small 3.1 24B** | Mistral AI | Open Weights | Reasoning | 1,28,000 tokens | $0.35 | `general_purpose, chat, instruction_following` |
| 14 | **Mistral: Saba** | Mistral AI | Open Weights | General LLM | 32,768 tokens | $0.20 | `general_purpose, chat, instruction_following` |
| 15 | **Mistral: Mistral Small 3** | Mistral AI | Open Weights | General LLM | 32,768 tokens | $0.05 | `general_purpose, chat, instruction_following` |

