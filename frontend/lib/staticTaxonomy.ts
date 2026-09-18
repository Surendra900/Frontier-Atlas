export const staticTaxonomy = [
  {
    id: "core-ai",
    name: "Core AI",
    iconName: "Brain",
    methods: [
      { id: "general", name: "General", slug: "general", description: "Core AI methods for learning, reasoning, and intelligent decision-making.", paperCount: 0 },
      { id: "language", name: "Language", slug: "language", description: "Methods for understanding, generating, and translating natural language.", paperCount: 0 },
      { id: "computer-vision", name: "Computer Vision", slug: "computer-vision", description: "Techniques for understanding images, videos, and visual content.", paperCount: 0 },
      { id: "audio-speech", name: "Audio & Speech", slug: "audio-speech", description: "Methods for speech recognition, synthesis, and audio understanding.", paperCount: 0 },
      { id: "video", name: "Video", slug: "video", description: "Methods for video understanding, generation, and temporal analysis.", paperCount: 0 },
      { id: "multimodal", name: "Multimodal", slug: "multimodal", description: "Models combining text, images, audio, and video inputs.", paperCount: 0 },
      { id: "robotics", name: "Robotics", slug: "robotics", description: "AI methods for robot perception, planning, and interaction.", paperCount: 0 },
      { id: "embodied-ai", name: "Embodied AI", slug: "embodied-ai", description: "Intelligent agents learning through real-world interactions.", paperCount: 0 },
      { id: "3d-spatial", name: "3D & Spatial", slug: "3d-spatial", description: "Methods for 3D perception, mapping, and spatial reasoning.", paperCount: 0 },
      { id: "graph-learning", name: "Graph Learning", slug: "graph-learning", description: "Learning from graph-structured data and relationships.", paperCount: 0 },
      { id: "time-series", name: "Time Series", slug: "time-series", description: "Forecasting and modeling patterns in sequential time-series data.", paperCount: 0 },
      { id: "scientific-ai", name: "Scientific AI", slug: "scientific-ai", description: "AI methods advancing scientific research and discovery.", paperCount: 0 },
    ]
  },
  {
    id: "neural-architectures",
    name: "Neural Architectures",
    iconName: "Layers",
    methods: [
      { id: "transformer", name: "Transformer", slug: "transformer", description: "Attention-based neural architecture for sequence modeling and generation.", paperCount: 0 },
      { id: "mamba", name: "Mamba", slug: "mamba", description: "State space architecture designed for efficient long-context sequence modeling.", paperCount: 0 },
      { id: "state-space-models", name: "State Space Models", slug: "state-space-models", description: "State-space models for capturing long-range dependencies.", paperCount: 0 },
      { id: "convolutional-networks", name: "Convolutional Networks", slug: "convolutional-networks", description: "Neural networks specialized for extracting spatial features from data.", paperCount: 0 },
      { id: "recurrent-networks", name: "Recurrent Networks", slug: "recurrent-networks", description: "Neural architectures designed for sequential and time-dependent data.", paperCount: 0 },
      { id: "graph-neural-networks", name: "Graph Neural Networks", slug: "graph-neural-networks", description: "Models that learn representations from graph-structured data.", paperCount: 0 },
      { id: "mixture-of-experts-moe", name: "Mixture of Experts", slug: "mixture-of-experts", description: "Architecture that routes inputs to specialized expert networks.", paperCount: 0 },
      { id: "autoencoders", name: "Autoencoders", slug: "autoencoders", description: "Neural models that learn compact representations by reconstructing inputs.", paperCount: 0 },
      { id: "generative-adversarial-networks", name: "Generative Adversarial Networks", slug: "generative-adversarial-networks", description: "Generative models using generator-discriminator competition.", paperCount: 0 },
      { id: "diffusion-architectures", name: "Diffusion Architectures", slug: "diffusion-architectures", description: "Generative architectures that create data through iterative denoising.", paperCount: 0 },
    ]
  },
  {
    id: "neural-components",
    name: "Neural Components",
    iconName: "Puzzle",
    methods: [
      { id: "attention", name: "Attention", slug: "attention", description: "Mechanisms that focus on the most relevant parts of input data.", paperCount: 0 },
      { id: "embeddings", name: "Embeddings", slug: "embeddings", description: "Dense vector embeddings capturing semantic meaning.", paperCount: 0 },
      { id: "positional-encoding", name: "Positional Encoding", slug: "positional-encoding", description: "Methods that encode sequence order for transformer-based models.", paperCount: 0 },
      { id: "feedforward-networks", name: "Feedforward Networks", slug: "feedforward-networks", description: "Fully connected neural layers for feature transformation and learning.", paperCount: 0 },
      { id: "activation-functions", name: "Activation Functions", slug: "activation-functions", description: "Functions introducing non-linearity to improve model learning capacity.", paperCount: 0 },
      { id: "normalization", name: "Normalization", slug: "normalization", description: "Techniques that stabilize training and improve model convergence.", paperCount: 0 },
      { id: "residual-connections", name: "Residual Connections", slug: "residual-connections", description: "Connections that improve gradient flow in deep neural networks.", paperCount: 0 },
      { id: "pooling", name: "Pooling", slug: "pooling", description: "Methods for reducing feature dimensions while preserving key information.", paperCount: 0 },
      { id: "convolution", name: "Convolution", slug: "convolution", description: "Neural operations that extract local patterns from structured data.", paperCount: 0 },
      { id: "tokenization", name: "Tokenization", slug: "tokenization", description: "Methods for splitting text into tokens for language model processing.", paperCount: 0 },
    ]
  },
  {
    id: "training",
    name: "Training",
    iconName: "Dumbbell",
    methods: [
      { id: "pre-training", name: "Pre-training", slug: "pre-training", description: "Training models on large datasets to learn general-purpose representations.", paperCount: 0 },
      { id: "fine-tuning", name: "Fine-tuning", slug: "fine-tuning", description: "Adapting pre-trained models for specific downstream tasks.", paperCount: 0 },
      { id: "instruction-tuning", name: "Instruction Tuning", slug: "instruction-tuning", description: "Training models to better understand and follow user instructions.", paperCount: 0 },
      { id: "continued-pretraining", name: "Continued Pretraining", slug: "continued-pretraining", description: "Extending pre-training using additional domain-specific datasets.", paperCount: 0 },
      { id: "self-supervised-learning", name: "Self-Supervised Learning", slug: "self-supervised-learning", description: "Learning meaningful representations without manually labeled data.", paperCount: 0 },
      { id: "semi-supervised-learning", name: "Semi-Supervised Learning", slug: "semi-supervised-learning", description: "Combining labeled and unlabeled data to improve model performance.", paperCount: 0 },
      { id: "transfer-learning", name: "Transfer Learning", slug: "transfer-learning", description: "Reusing knowledge learned from one task to solve another.", paperCount: 0 },
      { id: "curriculum-learning", name: "Curriculum Learning", slug: "curriculum-learning", description: "Training models progressively from simpler tasks to harder ones.", paperCount: 0 },
      { id: "multi-task-learning", name: "Multi-task Learning", slug: "multi-task-learning", description: "Learning multiple related tasks within a shared model architecture.", paperCount: 0 },
      { id: "continual-learning", name: "Continual Learning", slug: "continual-learning", description: "Methods enabling models to learn continuously without forgetting.", paperCount: 0 },
      { id: "distillation", name: "Distillation", slug: "distillation", description: "Transferring knowledge from larger models into smaller, efficient models.", paperCount: 0 },
      { id: "teacher-forcing", name: "Teacher Forcing", slug: "teacher-forcing", description: "Training sequence models using target outputs as guidance.", paperCount: 0 }
    ]
  },
  {
    id: "alignment",
    name: "Alignment",
    iconName: "Shield",
    methods: [
      { id: "rlhf", name: "RLHF", slug: "rlhf", description: "Aligning models with human preferences through reinforcement learning.", paperCount: 0 },
      { id: "dpo", name: "DPO", slug: "dpo", description: "Preference optimization without reinforcement learning.", paperCount: 0 },
      { id: "preference-optimization", name: "Preference Optimization", slug: "preference-optimization", description: "Optimizing model behavior using human or synthetic preferences.", paperCount: 0 },
      { id: "reward-modeling", name: "Reward Modeling", slug: "reward-modeling", description: "Learning reward functions for optimizing machine learning models.", paperCount: 0 },
      { id: "constitutional-ai", name: "Constitutional AI", slug: "constitutional-ai", description: "Aligning AI behavior using predefined principles and rules.", paperCount: 0 },
      { id: "ai-feedback", name: "AI Feedback", slug: "ai-feedback", description: "Improving models using feedback generated by other AI systems.", paperCount: 0 }
    ]
  },
  {
    id: "prompting-reasoning",
    name: "Prompting & Reasoning",
    iconName: "MessageSquare",
    methods: [
      { id: "prompting", name: "Prompting", slug: "prompting", description: "Guiding model behavior through carefully designed prompts and instructions.", paperCount: 0 },
      { id: "chain-of-thought", name: "Chain of Thought", slug: "chain-of-thought", description: "Reasoning step by step to solve complex problems effectively.", paperCount: 0 },
      { id: "reasoning", name: "Reasoning", slug: "reasoning", description: "Methods for logical inference, analysis, and decision-making.", paperCount: 0 },
      { id: "planning", name: "Planning", slug: "planning", description: "Breaking complex goals into structured actions and intermediate steps.", paperCount: 0 },
      { id: "search", name: "Search", slug: "search", description: "Finding relevant information efficiently across large search spaces.", paperCount: 0 },
      { id: "reflection", name: "Reflection", slug: "reflection", description: "Improving responses through self-evaluation and iterative refinement.", paperCount: 0 }
    ]
  },
  {
    id: "agents",
    name: "Agents",
    iconName: "Bot",
    methods: [
      { id: "tool-use", name: "Tool Use", slug: "tool-use", description: "Using external tools and APIs to complete complex tasks.", paperCount: 0 },
      { id: "react", name: "ReAct", slug: "react", description: "Combining reasoning and actions to solve multi-step problems.", paperCount: 0 },
      { id: "function-calling", name: "Function Calling", slug: "function-calling", description: "Invoking external functions and APIs during model execution.", paperCount: 0 },
      { id: "agent-memory", name: "Agent Memory", slug: "agent-memory", description: "Maintaining context and recalling information across interactions.", paperCount: 0 },
      { id: "multi-agent-systems", name: "Multi-Agent Systems", slug: "multi-agent-systems", description: "Coordinating multiple intelligent agents to achieve shared goals.", paperCount: 0 },
      { id: "workflow-orchestration", name: "Workflow Orchestration", slug: "workflow-orchestration", description: "Managing multi-step AI workflows and task execution pipelines.", paperCount: 0 },
      { id: "mcp", name: "Model Context Protocol (MCP)", slug: "model-context-protocol-mcp", description: "Standardized communication between AI models, tools, and services.", paperCount: 0 }
    ]
  },
  {
    id: "retrieval",
    name: "Retrieval",
    iconName: "DatabaseZap",
    methods: [
      { id: "rag", name: "Retrieval-Augmented Generation", slug: "retrieval-augmented-generation", description: "Combines retrieval with language generation.", paperCount: 0 },
      { id: "dense-retrieval", name: "Dense Retrieval", slug: "dense-retrieval", description: "Retrieving documents using semantic vector representations.", paperCount: 0 },
      { id: "sparse-retrieval", name: "Sparse Retrieval", slug: "sparse-retrieval", description: "Keyword-based retrieval using sparse text representations.", paperCount: 0 },
      { id: "hybrid-retrieval", name: "Hybrid Retrieval", slug: "hybrid-retrieval", description: "Combining dense and sparse retrieval for improved search quality.", paperCount: 0 },
      { id: "reranking", name: "Reranking", slug: "reranking", description: "Reordering retrieved results based on relevance and quality.", paperCount: 0 },
      { id: "vector-search", name: "Vector Search", slug: "vector-search", description: "Searching data using vector embeddings and similarity matching.", paperCount: 0 },
      { id: "knowledge-graphs", name: "Knowledge Graphs", slug: "knowledge-graphs", description: "Structured graphs representing entities and relationships.", paperCount: 0 }
    ]
  },
  {
    id: "adaptation",
    name: "Adaptation",
    iconName: "Sliders",
    methods: [
      { id: "lora", name: "LoRA", slug: "lora", description: "Low-rank adaptation for efficient fine-tuning of large models.", paperCount: 0 },
      { id: "qlora", name: "QLoRA", slug: "qlora", description: "Quantized LoRA for memory-efficient model fine-tuning.", paperCount: 0 },
      { id: "peft", name: "PEFT", slug: "peft", description: "Parameter-efficient methods for adapting large language models.", paperCount: 0 },
      { id: "prompt-tuning", name: "Prompt Tuning", slug: "prompt-tuning", description: "Learning task-specific prompts without updating all model weights.", paperCount: 0 },
      { id: "prefix-tuning", name: "Prefix Tuning", slug: "prefix-tuning", description: "Optimizing trainable prefix representations for downstream tasks.", paperCount: 0 },
      { id: "adapter-tuning", name: "Adapter Tuning", slug: "adapter-tuning", description: "Fine-tuning lightweight adapter layers while freezing base models.", paperCount: 0 }
    ]
  },
  {
    id: "optimization",
    name: "Optimization",
    iconName: "TrendingUp",
    methods: [
      { id: "optimizers", name: "Optimizers", slug: "optimizers", description: "Algorithms that update model parameters for efficient and stable learning.", paperCount: 0 },
      { id: "learning-rate-scheduling", name: "Learning Rate Scheduling", slug: "learning-rate-scheduling", description: "Techniques that adjust learning rates throughout the training process.", paperCount: 0 },
      { id: "initialization", name: "Initialization", slug: "initialization", description: "Methods for setting initial model parameters before training begins.", paperCount: 0 },
      { id: "gradient-methods", name: "Gradient Methods", slug: "gradient-methods", description: "Gradient-based optimization for updating machine learning models.", paperCount: 0 }
    ]
  },
  {
    id: "regularization",
    name: "Regularization",
    iconName: "CircleDot",
    methods: [
      { id: "dropout", name: "Dropout", slug: "dropout", description: "Randomly disabling neurons during training to reduce model overfitting.", paperCount: 0 },
      { id: "weight-regularization", name: "Weight Regularization", slug: "weight-regularization", description: "Constraining model weights to improve generalization and robustness.", paperCount: 0 },
      { id: "label-smoothing", name: "Label Smoothing", slug: "label-smoothing", description: "Softening target labels to improve model confidence and accuracy.", paperCount: 0 },
      { id: "data-augmentation", name: "Data Augmentation", slug: "data-augmentation", description: "Expanding training datasets with transformed or synthetic examples.", paperCount: 0 }
    ]
  },
  {
    id: "efficiency",
    name: "Efficiency",
    iconName: "Zap",
    methods: [
      { id: "quantization", name: "Quantization", slug: "quantization", description: "Reducing numerical precision for faster and more efficient inference.", paperCount: 0 },
      { id: "pruning", name: "Pruning", slug: "pruning", description: "Removes unnecessary parameters while preserving performance.", paperCount: 0 },
      { id: "sparsity", name: "Sparsity", slug: "sparsity", description: "Using sparse representations to reduce computation.", paperCount: 0 },
      { id: "speculative-decoding", name: "Speculative Decoding", slug: "speculative-decoding", description: "Accelerating text generation through predictive decoding strategies.", paperCount: 0 },
      { id: "kv-cache", name: "KV Cache", slug: "kv-cache", description: "Caching attention states to speed up autoregressive model inference.", paperCount: 0 },
      { id: "pagedattention", name: "PagedAttention", slug: "pagedattention", description: "Memory-efficient attention for serving large language models efficiently.", paperCount: 0 },
      { id: "flashattention-2", name: "FlashAttention-2", slug: "flashattention-2", description: "Highly optimized attention algorithm for faster transformer execution.", paperCount: 0 },
      { id: "model-compression", name: "Model Compression", slug: "model-compression", description: "Reducing model size while preserving accuracy and performance.", paperCount: 0 },
      { id: "inference-optimization", name: "Inference Optimization", slug: "inference-optimization", description: "Techniques that improve model inference speed and resource efficiency.", paperCount: 0 }
    ]
  },
  {
    id: "reinforcement-learning",
    name: "Reinforcement Learning",
    iconName: "GitBranch",
    methods: [
      { id: "value-based-rl", name: "Value-based RL", slug: "value-based-rl", description: "Learning action values to maximize long-term rewards through experience.", paperCount: 0 },
      { id: "policy-optimization", name: "Policy Optimization", slug: "policy-optimization", description: "Optimizing decision-making policies for reinforcement learning agents.", paperCount: 0 },
      { id: "model-based-rl", name: "Model-based RL", slug: "model-based-rl", description: "Learning environment dynamics for better planning and decisions.", paperCount: 0 },
      { id: "offline-rl", name: "Offline RL", slug: "offline-rl", description: "Training reinforcement learning agents using fixed offline datasets.", paperCount: 0 },
      { id: "online-rl", name: "Online RL", slug: "online-rl", description: "Learning through real-time interactions with environments.", paperCount: 0 }
    ]
  },
  {
    id: "representation-learning",
    name: "Representation Learning",
    iconName: "Share2",
    methods: [
      { id: "contrastive-learning", name: "Contrastive Learning", slug: "contrastive-learning", description: "Learning representations by comparing similar and dissimilar samples.", paperCount: 0 },
      { id: "metric-learning", name: "Metric Learning", slug: "metric-learning", description: "Learning distance metrics that capture semantic similarity between samples.", paperCount: 0 },
      { id: "embedding-learning", name: "Embedding Learning", slug: "embedding-learning", description: "Creating dense feature representations for downstream tasks.", paperCount: 0 },
      { id: "feature-learning", name: "Feature Learning", slug: "feature-learning", description: "Automatically discovering useful features directly from raw input data.", paperCount: 0 }
    ]
  },
  {
    id: "diffusion",
    name: "Diffusion",
    iconName: "Repeat2",
    methods: [
      { id: "diffusion-models", name: "Diffusion Models", slug: "diffusion-models", description: "Generative models that create data through iterative denoising processes.", paperCount: 0 },
      { id: "flow-matching", name: "Flow Matching", slug: "flow-matching", description: "Learning continuous transformations for efficient generative modeling tasks.", paperCount: 0 },
      { id: "score-based-models", name: "Score-based Models", slug: "score-based-models", description: "Generative models that learn score functions over data distributions.", paperCount: 0 },
      { id: "consistency-models", name: "Consistency Models", slug: "consistency-models", description: "Fast generative models designed for high-quality one-step sampling.", paperCount: 0 }
    ]
  },
  {
    id: "vision",
    name: "Vision",
    iconName: "Eye",
    methods: [
      { id: "object-detection", name: "Object Detection", slug: "object-detection", description: "Detecting and localizing objects within images and video scenes.", paperCount: 0 },
      { id: "segmentation", name: "Segmentation", slug: "segmentation", description: "Partitioning images into regions for detailed understanding", paperCount: 0 },
      { id: "image-generation", name: "Image Generation", slug: "image-generation", description: "Generating realistic images from text, noise, or other visual inputs.", paperCount: 0 },
      { id: "image-classification", name: "Image Classification", slug: "image-classification", description: "Classifying images into predefined categories using deep learning models.", paperCount: 0 },
      { id: "pose-estimation", name: "Pose Estimation", slug: "pose-estimation", description: "Estimating human or object poses from images and videos.", paperCount: 0 },
      { id: "tracking", name: "Tracking", slug: "tracking", description: "Following objects consistently across multiple frames in video sequences.", paperCount: 0 },
      { id: "3d-vision", name: "3D Vision", slug: "3d-vision", description: "Understanding 3D scenes, geometry, and spatial relationships.", paperCount: 0 }
    ]
  },
  {
    id: "language",
    name: "Language",
    iconName: "BookOpen",
    methods: [
      { id: "lang-tokenization", name: "Tokenization", slug: "tokenization", description: "Splitting text into tokens for efficient language model processing.", paperCount: 0 },
      { id: "language-modeling", name: "Language Modeling", slug: "language-modeling", description: "Learning language patterns for text prediction and generation tasks.", paperCount: 0 },
      { id: "machine-translation", name: "Machine Translation", slug: "machine-translation", description: "Translating text accurately between different natural languages.", paperCount: 0 },
      { id: "text-generation", name: "Text Generation", slug: "text-generation", description: "Generating coherent and contextually relevant natural language text.", paperCount: 0 },
      { id: "summarization", name: "Summarization", slug: "summarization", description: "Producing concise summaries while preserving essential information.", paperCount: 0 },
      { id: "question-answering", name: "Question Answering", slug: "question-answering", description: "Answering questions using context, documents, or structured knowledge.", paperCount: 0 },
      { id: "information-extraction", name: "Information Extraction", slug: "information-extraction", description: "Extracting structured facts and entities from unstructured text.", paperCount: 0 }
    ]
  },
  {
    id: "audio",
    name: "Audio",
    iconName: "Mic",
    methods: [
      { id: "speech-recognition", name: "Speech Recognition", slug: "speech-recognition", description: "Converting spoken language into accurate text using AI models.", paperCount: 0 },
      { id: "speech-synthesis", name: "Speech Synthesis", slug: "speech-synthesis", description: "Generating realistic and natural-sounding speech from text inputs.", paperCount: 0 },
      { id: "speaker-recognition", name: "Speaker Recognition", slug: "speaker-recognition", description: "Identifying and verifying speakers from voice characteristics.", paperCount: 0 },
      { id: "audio-generation", name: "Audio Generation", slug: "audio-generation", description: "Generating speech, sound effects, and other synthetic audio content.", paperCount: 0 },
      { id: "music-generation", name: "Music Generation", slug: "music-generation", description: "Creating original music compositions using generative AI models.", paperCount: 0 }
    ]
  },
  {
    id: "video",
    name: "Video",
    iconName: "Video",
    methods: [
      { id: "video-understanding", name: "Video Understanding", slug: "video-understanding", description: "Analyzing video content to recognize events, actions, and scene dynamics.", paperCount: 0 },
      { id: "video-generation", name: "Video Generation", slug: "video-generation", description: "Generating realistic videos from text, images, or learned visual representations.", paperCount: 0 },
      { id: "video-segmentation", name: "Video Segmentation", slug: "video-segmentation", description: "Segmenting objects and regions consistently across video frames.", paperCount: 0 },
      { id: "video-retrieval", name: "Video Retrieval", slug: "video-retrieval", description: "Finding relevant videos using semantic search and similarity.", paperCount: 0 }
    ]
  },
  {
    id: "robotics",
    name: "Robotics",
    iconName: "Cpu",
    methods: [
      { id: "motion-planning", name: "Motion Planning", slug: "motion-planning", description: "Planning safe and efficient robot movements in complex environments.", paperCount: 0 },
      { id: "manipulation", name: "Manipulation", slug: "manipulation", description: "Controlling robotic interaction through grasping and manipulation.", paperCount: 0 },
      { id: "navigation", name: "Navigation", slug: "navigation", description: "Navigating autonomous robots in dynamic environments.", paperCount: 0 },
      { id: "policy-learning", name: "Policy Learning", slug: "policy-learning", description: "Learning robot control policies from experience, demonstrations, or rewards.", paperCount: 0 }
    ]
  },
  {
    id: "3d",
    name: "3D",
    iconName: "Layers",
    methods: [
      { id: "nerf", name: "NeRF", slug: "nerf", description: "Neural rendering method for reconstructing realistic three-dimensional scenes.", paperCount: 0 },
      { id: "gaussian-splatting", name: "Gaussian Splatting", slug: "gaussian-splatting", description: "Fast technique for high-quality rendering of complex 3D scenes.", paperCount: 0 },
      { id: "slam", name: "SLAM", slug: "slam", description: "Simultaneous localization and mapping for robotic perception and navigation.", paperCount: 0 },
      { id: "point-clouds", name: "Point Clouds", slug: "point-clouds", description: "Representing 3D environments using spatial point collections.", paperCount: 0 }
    ]
  },
  {
    id: "mathematics",
    name: "Mathematics",
    iconName: "BarChart2",
    methods: [
      { id: "optimization-theory", name: "Optimization Theory", slug: "optimization-theory", description: "Mathematical principles for optimization in machine learning.", paperCount: 0 },
      { id: "probability", name: "Probability", slug: "probability", description: "Modeling uncertainty and randomness with probabilistic frameworks.", paperCount: 0 },
      { id: "statistics", name: "Statistics", slug: "statistics", description: "Analyzing data distributions, patterns, and relationships through statistical methods.", paperCount: 0 },
      { id: "loss-functions", name: "Loss Functions", slug: "loss-functions", description: "Functions that measure prediction errors during model optimization.", paperCount: 0 },
      { id: "linear-algebra", name: "Linear Algebra", slug: "linear-algebra", description: "Foundation for vectors, matrices, and neural network computations.", paperCount: 0 }
    ]
  },
  {
    id: "evaluation",
    name: "Evaluation",
    iconName: "Microscope",
    methods: [
      { id: "metrics", name: "Metrics", slug: "metrics", description: "Measuring model accuracy, quality, and performance using evaluation metrics.", paperCount: 0 },
      { id: "human-evaluation", name: "Human Evaluation", slug: "human-evaluation", description: "Assessing AI outputs through human judgment and expert review.", paperCount: 0 },
      { id: "llm-as-a-judge", name: "LLM-as-a-Judge", slug: "llm-as-a-judge", description: "Using language models to evaluate responses and compare output quality.", paperCount: 0 },
      { id: "preference-evaluation", name: "Preference Evaluation", slug: "preference-evaluation", description: "Comparing model outputs using human or AI preference judgments.", paperCount: 0 },
      { id: "benchmarking", name: "Benchmarking", slug: "benchmarking", description: "Evaluating models against standardized datasets and benchmark tasks.", paperCount: 0 }
    ]
  },
  {
    id: "interpretability",
    name: "Interpretability",
    iconName: "Telescope",
    methods: [
      { id: "mechanistic-interpretability", name: "Mechanistic Interpretability", slug: "mechanistic-interpretability", description: "Studying internal model mechanisms to understand learned behaviors.", paperCount: 0 },
      { id: "attribution", name: "Attribution", slug: "attribution", description: "Identifying which inputs contribute most to model predictions.", paperCount: 0 },
      { id: "probing", name: "Probing", slug: "probing", description: "Using diagnostic probes to analyze learned representations.", paperCount: 0 },
      { id: "explainability", name: "Explainability", slug: "explainability", description: "Making AI decisions more transparent and understandable for users.", paperCount: 0 }
    ]
  },
  {
    id: "safety",
    name: "Safety",
    iconName: "Lock",
    methods: [
      { id: "hallucination", name: "Hallucination", slug: "hallucination", description: "Reducing inaccurate or fabricated content generated by AI systems.", paperCount: 0 },
      { id: "watermarking", name: "Watermarking", slug: "watermarking", description: "Embedding identifiable markers into AI-generated content for verification.", paperCount: 0 },
      { id: "alignment-safety", name: "Alignment Safety", slug: "alignment-safety", description: "Ensuring AI systems behave safely and follow intended objectives.", paperCount: 0 },
      { id: "jailbreak-defense", name: "Jailbreak Defense", slug: "jailbreak-defense", description: "Protecting models against prompt injection and jailbreak attacks.", paperCount: 0 },
      { id: "robustness", name: "Robustness", slug: "robustness", description: "Improving model reliability under noisy, adversarial, or changing conditions.", paperCount: 0 },
      { id: "privacy", name: "Privacy", slug: "privacy", description: "Protecting sensitive data throughout model training and deployment.", paperCount: 0 }
    ]
  },
  {
    id: "systems",
    name: "Systems",
    iconName: "Server",
    methods: [
      { id: "distributed-training", name: "Distributed Training", slug: "distributed-training", description: "Scaling model training across multiple machines and computing devices.", paperCount: 0 },
      { id: "parallelism", name: "Parallelism", slug: "parallelism", description: "Executing model computations to improve training efficiency.", paperCount: 0 },
      { id: "serving", name: "Serving", slug: "serving", description: "Deploying AI models for reliable, large-scale production inference.", paperCount: 0 },
      { id: "inference-systems", name: "Inference Systems", slug: "inference-systems", description: "Systems optimized for fast and scalable model inference workloads.", paperCount: 0 },
      { id: "memory-optimization", name: "Memory Optimization", slug: "memory-optimization", description: "Reducing memory usage while maintaining efficient model performance.", paperCount: 0 }
    ]
  },
  {
    id: "hardware",
    name: "Hardware",
    iconName: "HardDrive",
    methods: [
      { id: "gpus", name: "GPUs", slug: "gpus", description: "Graphics processors optimized for large-scale AI training and inference.", paperCount: 0 },
      { id: "tpus", name: "TPUs", slug: "tpus", description: "Google-designed accelerators for machine learning workloads.", paperCount: 0 },
      { id: "npus", name: "NPUs", slug: "npus", description: "Dedicated neural processors for efficient on-device AI computation.", paperCount: 0 },
      { id: "accelerators", name: "Accelerators", slug: "accelerators", description: "Specialized hardware designed to speed up AI model execution.", paperCount: 0 }
    ]
  },
  {
    id: "research-concepts",
    name: "Research Concepts",
    iconName: "FlaskConical",
    methods: [
      { id: "scaling-laws", name: "Scaling Laws", slug: "scaling-laws", description: "Studying how model performance improves with increased scale and data.", paperCount: 0 },
      { id: "emergence", name: "Emergence", slug: "emergence", description: "Unexpected capabilities that appear as AI models become larger.", paperCount: 0 },
      { id: "in-context-learning", name: "In-Context Learning", slug: "in-context-learning", description: "Learning new tasks from examples provided directly within prompts.", paperCount: 0 },
      { id: "test-time-compute", name: "Test-Time Compute", slug: "test-time-compute", description: "Using extra computation during inference to improve performance.", paperCount: 0 },
      { id: "context-engineering", name: "Context Engineering", slug: "context-engineering", description: "Optimizing prompts and context to improve model responses consistently.", paperCount: 0 },
      { id: "world-models", name: "World Models", slug: "world-models", description: "Learning internal environment representations for planning.", paperCount: 0 },
      { id: "foundation-models", name: "Foundation Models", slug: "foundation-models", description: "Large pre-trained models adaptable to diverse downstream AI applications.", paperCount: 0 }
    ]
  }
];