# Models Module Audit (Before)

**Audit Timestamp**: 2026-09-30T16:26:25.006Z
**Database Tested**: SHARD_2 (Primary Neon Pooler)
**Total Unique Cards Audited**: 670

| Section | Card Label | Card Slug | Reported Facet Count | DB Query Result Count | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Capability | General Purpose | `general-purpose` | 574 | 0 | **FAIL (ZERO)** |
| Capability | Chat | `chat` | 536 | 2 | **POPULATED** |
| Capability | Instruction Following | `instruction-following` | 534 | 0 | **FAIL (ZERO)** |
| Capability | Reasoning | `reasoning` | 453 | 335 | **POPULATED** |
| Capability | Coding | `coding` | 425 | 0 | **FAIL (ZERO)** |
| Capability | Multimodal | `multimodal` | 149 | 0 | **FAIL (ZERO)** |
| Capability | Computer Vision | `computer-vision` | 86 | 0 | **FAIL (ZERO)** |
| Capability | Translation | `translation` | 66 | 0 | **FAIL (ZERO)** |
| Capability | Audio | `audio` | 35 | 44 | **POPULATED** |
| Capability | Document AI | `document-ai` | 34 | 0 | **FAIL (ZERO)** |
| Capability | OCR | `ocr` | 33 | 0 | **FAIL (ZERO)** |
| Capability | Speech | `speech` | 32 | 0 | **FAIL (ZERO)** |
| Capability | Tool Use | `tool-use` | 25 | 0 | **FAIL (ZERO)** |
| Capability | Planning | `planning` | 22 | 0 | **FAIL (ZERO)** |
| Capability | Agents | `agents` | 20 | 0 | **FAIL (ZERO)** |
| Capability | Search | `search` | 10 | 3 | **POPULATED** |
| Capability | Mathematics | `mathematics` | 6 | 0 | **FAIL (ZERO)** |
| Capability | Embeddings | `embeddings` | 5 | 0 | **FAIL (ZERO)** |
| Capability | Healthcare | `healthcare` | 4 | 0 | **FAIL (ZERO)** |
| Model Family | Bielik | `bielik` | 45 | 0 | **FAIL (ZERO)** |
| Model Family | Claude | `claude` | 44 | 33 | **POPULATED** |
| Model Family | Gemini | `gemini` | 32 | 33 | **POPULATED** |
| Model Family | Qwen 2.5 | `qwen-2-5` | 16 | 0 | **FAIL (ZERO)** |
| Model Family | Gemma 3 | `gemma-3` | 15 | 0 | **FAIL (ZERO)** |
| Model Family | Qwen 3 | `qwen-3` | 14 | 0 | **FAIL (ZERO)** |
| Model Family | DeepSeek V3 | `deepseek-v3` | 14 | 6 | **POPULATED** |
| Model Family | Llama 3.1 | `llama-3-1` | 12 | 0 | **FAIL (ZERO)** |
| Model Family | Qwen 3.5 | `qwen-3-5` | 11 | 0 | **FAIL (ZERO)** |
| Model Family | Mistral Small | `mistral-small` | 9 | 5 | **POPULATED** |
| Model Family | GPT-5 | `gpt-5` | 9 | 47 | **POPULATED** |
| Model Family | Qwen 2 | `qwen-2` | 9 | 0 | **FAIL (ZERO)** |
| Model Family | GPT-5.4 | `gpt-5-4` | 9 | 0 | **FAIL (ZERO)** |
| Model Family | Mistral 7B | `mistral-7b` | 8 | 0 | **FAIL (ZERO)** |
| Model Family | GPT-4o | `gpt-4o` | 7 | 8 | **POPULATED** |
| Model Family | Llama 3 | `llama-3` | 7 | 0 | **FAIL (ZERO)** |
| Model Family | InternLM 2 | `internlm-2` | 7 | 0 | **FAIL (ZERO)** |
| Model Family | Llama 3.2 | `llama-3-2` | 6 | 0 | **FAIL (ZERO)** |
| Model Family | o1 | `o1` | 6 | 2 | **POPULATED** |
| Model Family | GPT-5.2 | `gpt-5-2` | 6 | 0 | **FAIL (ZERO)** |
| Model Family | Qwen 1.5 | `qwen-1-5` | 6 | 0 | **FAIL (ZERO)** |
| Model Family | Ministral | `ministral` | 5 | 4 | **POPULATED** |
| Model Family | Mistral Large | `mistral-large` | 5 | 4 | **POPULATED** |
| Model Family | o3 | `o3` | 5 | 6 | **POPULATED** |
| Model Family | Llama 4 | `llama-4` | 5 | 0 | **FAIL (ZERO)** |
| Model Family | DeepSeek R1 | `deepseek-r1` | 5 | 2 | **POPULATED** |
| Model Family | Gemma 2 | `gemma-2` | 5 | 0 | **FAIL (ZERO)** |
| Model Family | GPT-5 Codex | `gpt-5-codex` | 5 | 0 | **FAIL (ZERO)** |
| Model Family | PLLuM | `pllum` | 5 | 0 | **FAIL (ZERO)** |
| Model Family | Swin Transformer | `swin-transformer` | 5 | 0 | **FAIL (ZERO)** |
| Organization | Google | `google` | 87 | 43 | **POPULATED** |
| Organization | OpenAI | `openai` | 83 | 109 | **POPULATED** |
| Organization | Alibaba | `alibaba` | 79 | 54 | **POPULATED** |
| Organization | Meta | `meta` | 55 | 14 | **POPULATED** |
| Organization | SpeakLeash | `speakleash` | 46 | 0 | **FAIL (ZERO)** |
| Organization | Anthropic | `anthropic` | 44 | 33 | **POPULATED** |
| Organization | Mistral | `mistral` | 39 | 23 | **POPULATED** |
| Organization | Microsoft | `microsoft` | 35 | 2 | **POPULATED** |
| Organization | DeepSeek | `deepseek` | 28 | 18 | **POPULATED** |
| Organization | Zhipu AI | `zhipu-ai` | 13 | 0 | **FAIL (ZERO)** |
| Organization | ByteDance | `bytedance` | 11 | 7 | **POPULATED** |
| Organization | xAI | `xai` | 10 | 9 | **POPULATED** |
| Organization | NVIDIA | `nvidia` | 10 | 10 | **POPULATED** |
| Organization | internlm | `internlm` | 9 | 0 | **FAIL (ZERO)** |
| Organization | Salesforce | `salesforce` | 9 | 0 | **FAIL (ZERO)** |
| Organization | Baidu | `baidu` | 8 | 1 | **POPULATED** |
| Organization | PLLuM | `pllum` | 8 | 0 | **FAIL (ZERO)** |
| Organization | ilessio-aiflowlab | `ilessio-aiflowlab` | 8 | 0 | **FAIL (ZERO)** |
| Organization | Mistral AI | `mistral-ai` | 7 | 25 | **POPULATED** |
| Organization | ibm-granite | `ibm-granite` | 7 | 2 | **POPULATED** |
| Organization | allenai | `allenai` | 7 | 0 | **FAIL (ZERO)** |
| Organization | Amazon | `amazon` | 7 | 5 | **POPULATED** |
| Organization | MiniMax | `minimax` | 7 | 8 | **POPULATED** |
| Organization | Shanghai AI Lab | `shanghai-ai-lab` | 7 | 0 | **FAIL (ZERO)** |
| Organization | hustvl | `hustvl` | 7 | 0 | **FAIL (ZERO)** |
| Organization | Microsoft Research | `microsoft-research` | 6 | 0 | **FAIL (ZERO)** |
| Organization | CohereForAI | `cohereforai` | 6 | 0 | **FAIL (ZERO)** |
| Organization | Remek | `remek` | 6 | 0 | **FAIL (ZERO)** |
| Organization | cesun | `cesun` | 6 | 0 | **FAIL (ZERO)** |
| Organization | THUML | `thuml` | 5 | 0 | **FAIL (ZERO)** |
| Organization | utter-project | `utter-project` | 5 | 0 | **FAIL (ZERO)** |
| Organization | Cohere | `cohere` | 5 | 6 | **POPULATED** |
| Organization | BAAI | `baai` | 5 | 0 | **FAIL (ZERO)** |
| Organization | Moonshot AI | `moonshot-ai` | 5 | 9 | **POPULATED** |
| Organization | nvidia | `nvidia` | 5 | 10 | **POPULATED** |
| Organization | Zhang199 | `zhang199` | 5 | 0 | **FAIL (ZERO)** |
| Organization | Alibaba Cloud | `alibaba-cloud` | 5 | 0 | **FAIL (ZERO)** |
| Organization | mradermacher | `mradermacher` | 5 | 0 | **FAIL (ZERO)** |
| Organization | cycloneboy | `cycloneboy` | 5 | 0 | **FAIL (ZERO)** |
| Organization | VikParuchuri | `vikparuchuri` | 4 | 0 | **FAIL (ZERO)** |
| Organization | UC San Diego | `uc-san-diego` | 4 | 0 | **FAIL (ZERO)** |
| Organization | Meituan | `meituan` | 4 | 1 | **POPULATED** |
| Organization | tiiuae | `tiiuae` | 4 | 0 | **FAIL (ZERO)** |
| Organization | Facebook AI | `facebook-ai` | 4 | 0 | **FAIL (ZERO)** |
| Organization | IBM | `ibm` | 4 | 0 | **FAIL (ZERO)** |
| Organization | Stanford | `stanford` | 4 | 0 | **FAIL (ZERO)** |
| Organization | NousResearch | `nousresearch` | 4 | 3 | **POPULATED** |
| Organization | microsoft | `microsoft` | 4 | 2 | **POPULATED** |
| Organization | Mungert | `mungert` | 4 | 0 | **FAIL (ZERO)** |
| Organization | 01-ai | `01-ai` | 4 | 0 | **FAIL (ZERO)** |
| Organization | HiDream-ai | `hidream-ai` | 4 | 0 | **FAIL (ZERO)** |
| Organization | DeepMind | `deepmind` | 4 | 0 | **FAIL (ZERO)** |
| Organization | aimagelab | `aimagelab` | 4 | 0 | **FAIL (ZERO)** |
| Organization | zai-org | `zai-org` | 4 | 0 | **FAIL (ZERO)** |
| Organization | llm-jp | `llm-jp` | 3 | 0 | **FAIL (ZERO)** |
| Organization | THU-KEG | `thu-keg` | 3 | 0 | **FAIL (ZERO)** |
| Organization | IDEA Research | `idea-research` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Nam Tuan Ly / NII | `nam-tuan-ly-nii` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Xtra-Computing | `xtra-computing` | 3 | 0 | **FAIL (ZERO)** |
| Organization | THUDM | `thudm` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Zhao et al. | `zhao-et-al` | 3 | 0 | **FAIL (ZERO)** |
| Organization | prachuryyaIITG | `prachuryyaiitg` | 3 | 0 | **FAIL (ZERO)** |
| Organization | AI4Protein | `ai4protein` | 3 | 0 | **FAIL (ZERO)** |
| Organization | axiomlaborg | `axiomlaborg` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Fudan University | `fudan-university` | 3 | 0 | **FAIL (ZERO)** |
| Organization | OPI-PG | `opi-pg` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Liao et al. | `liao-et-al` | 3 | 0 | **FAIL (ZERO)** |
| Organization | OpenDataLab | `opendatalab` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Seanie-lee | `seanie-lee` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Allen AI | `allen-ai` | 3 | 0 | **FAIL (ZERO)** |
| Organization | JWonderLand | `jwonderland` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Xiaomi | `xiaomi` | 3 | 5 | **POPULATED** |
| Organization | histai | `histai` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Du et al. | `du-et-al` | 3 | 0 | **FAIL (ZERO)** |
| Organization | knowledgeable-ai | `knowledgeable-ai` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Hon-Wong | `hon-wong` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Weiyifan | `weiyifan` | 3 | 0 | **FAIL (ZERO)** |
| Organization | cfcamo | `cfcamo` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Boogu | `boogu` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ViCoS Lab Ljubljana | `vicos-lab-ljubljana` | 3 | 0 | **FAIL (ZERO)** |
| Organization | AscendKernelGen | `ascendkernelgen` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Paranioar | `paranioar` | 3 | 0 | **FAIL (ZERO)** |
| Organization | DFQ-Dojo | `dfq-dojo` | 3 | 0 | **FAIL (ZERO)** |
| Organization | dlab-spp | `dlab-spp` | 3 | 0 | **FAIL (ZERO)** |
| Organization | AI45Research | `ai45research` | 3 | 0 | **FAIL (ZERO)** |
| Organization | PaDT-MLLM | `padt-mllm` | 3 | 0 | **FAIL (ZERO)** |
| Organization | geotessera | `geotessera` | 3 | 0 | **FAIL (ZERO)** |
| Organization | MathLLMs | `mathllms` | 3 | 0 | **FAIL (ZERO)** |
| Organization | DataSnake | `datasnake` | 3 | 0 | **FAIL (ZERO)** |
| Organization | lew96123 | `lew96123` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Moonshot.AI | `moonshot-ai` | 3 | 9 | **POPULATED** |
| Organization | akera | `akera` | 3 | 0 | **FAIL (ZERO)** |
| Organization | SherryXTChen | `sherryxtchen` | 3 | 0 | **FAIL (ZERO)** |
| Organization | EQUES | `eques` | 3 | 0 | **FAIL (ZERO)** |
| Organization | google | `google` | 3 | 43 | **POPULATED** |
| Organization | TrustHLT | `trusthlt` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ControlGenAI | `controlgenai` | 3 | 0 | **FAIL (ZERO)** |
| Organization | openbmb | `openbmb` | 3 | 0 | **FAIL (ZERO)** |
| Organization | purbeshmitra | `purbeshmitra` | 3 | 0 | **FAIL (ZERO)** |
| Organization | XiaSheng | `xiasheng` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ssgyejin | `ssgyejin` | 3 | 0 | **FAIL (ZERO)** |
| Organization | stepfun-ai | `stepfun-ai` | 3 | 0 | **FAIL (ZERO)** |
| Organization | u-opsd | `u-opsd` | 3 | 0 | **FAIL (ZERO)** |
| Organization | yueliu1999 | `yueliu1999` | 3 | 0 | **FAIL (ZERO)** |
| Organization | FastVideo | `fastvideo` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ddvd233 | `ddvd233` | 3 | 0 | **FAIL (ZERO)** |
| Organization | leoflx | `leoflx` | 3 | 0 | **FAIL (ZERO)** |
| Organization | d3LLM | `d3llm` | 3 | 0 | **FAIL (ZERO)** |
| Organization | embed2scale | `embed2scale` | 3 | 0 | **FAIL (ZERO)** |
| Organization | RobinWZQ | `robinwzq` | 3 | 0 | **FAIL (ZERO)** |
| Organization | PKU-ML | `pku-ml` | 3 | 0 | **FAIL (ZERO)** |
| Organization | kolerk | `kolerk` | 3 | 0 | **FAIL (ZERO)** |
| Organization | griffith-bigdata | `griffith-bigdata` | 3 | 0 | **FAIL (ZERO)** |
| Organization | GMLHUHE | `gmlhuhe` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ai-for-good-lab | `ai-for-good-lab` | 3 | 0 | **FAIL (ZERO)** |
| Organization | jusjinuk | `jusjinuk` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ut-enyac | `ut-enyac` | 3 | 0 | **FAIL (ZERO)** |
| Organization | amd | `amd` | 3 | 0 | **FAIL (ZERO)** |
| Organization | YHLLEO | `yhlleo` | 3 | 0 | **FAIL (ZERO)** |
| Organization | prithivMLmods | `prithivmlmods` | 3 | 0 | **FAIL (ZERO)** |
| Organization | dsba-lab | `dsba-lab` | 3 | 0 | **FAIL (ZERO)** |
| Organization | rubricreward | `rubricreward` | 3 | 0 | **FAIL (ZERO)** |
| Organization | SanghyukChun | `sanghyukchun` | 3 | 0 | **FAIL (ZERO)** |
| Organization | mair-lab | `mair-lab` | 3 | 0 | **FAIL (ZERO)** |
| Organization | WhyTheMoon | `whythemoon` | 3 | 0 | **FAIL (ZERO)** |
| Organization | xl-zhao | `xl-zhao` | 3 | 0 | **FAIL (ZERO)** |
| Organization | thenlpresearcher | `thenlpresearcher` | 3 | 0 | **FAIL (ZERO)** |
| Organization | XXHStudyHard | `xxhstudyhard` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Jasaxion | `jasaxion` | 3 | 0 | **FAIL (ZERO)** |
| Organization | bishoygaloaa | `bishoygaloaa` | 3 | 0 | **FAIL (ZERO)** |
| Organization | blanchon | `blanchon` | 3 | 0 | **FAIL (ZERO)** |
| Organization | jasperai | `jasperai` | 3 | 0 | **FAIL (ZERO)** |
| Organization | IDEA-Emdoor | `idea-emdoor` | 3 | 0 | **FAIL (ZERO)** |
| Organization | McGill-NLP | `mcgill-nlp` | 3 | 0 | **FAIL (ZERO)** |
| Organization | blaz-r | `blaz-r` | 3 | 0 | **FAIL (ZERO)** |
| Organization | nasos10 | `nasos10` | 3 | 0 | **FAIL (ZERO)** |
| Organization | fla-hub | `fla-hub` | 3 | 0 | **FAIL (ZERO)** |
| Organization | TMLR-Group-HF | `tmlr-group-hf` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ldxxx | `ldxxx` | 3 | 0 | **FAIL (ZERO)** |
| Organization | EvilScript | `evilscript` | 3 | 0 | **FAIL (ZERO)** |
| Organization | GTAlign | `gtalign` | 3 | 0 | **FAIL (ZERO)** |
| Organization | TEDBench | `tedbench` | 3 | 0 | **FAIL (ZERO)** |
| Organization | jhcodec | `jhcodec` | 3 | 0 | **FAIL (ZERO)** |
| Organization | extreme1228 | `extreme1228` | 3 | 0 | **FAIL (ZERO)** |
| Organization | MoNE-Pruning | `mone-pruning` | 3 | 0 | **FAIL (ZERO)** |
| Organization | strakajk | `strakajk` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ryokamoi | `ryokamoi` | 3 | 0 | **FAIL (ZERO)** |
| Organization | chenyitian-shanshu | `chenyitian-shanshu` | 3 | 0 | **FAIL (ZERO)** |
| Organization | cccczshao | `cccczshao` | 3 | 0 | **FAIL (ZERO)** |
| Organization | SenseLLM | `sensellm` | 3 | 0 | **FAIL (ZERO)** |
| Organization | tiantiaf | `tiantiaf` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ChangleQu | `changlequ` | 3 | 0 | **FAIL (ZERO)** |
| Organization | safe-diabetes-benchmark | `safe-diabetes-benchmark` | 3 | 0 | **FAIL (ZERO)** |
| Organization | hcarrion | `hcarrion` | 3 | 0 | **FAIL (ZERO)** |
| Organization | AbdomenAtlas | `abdomenatlas` | 3 | 0 | **FAIL (ZERO)** |
| Organization | juyil | `juyil` | 3 | 0 | **FAIL (ZERO)** |
| Organization | diffusion-reasoning | `diffusion-reasoning` | 3 | 0 | **FAIL (ZERO)** |
| Organization | tue-mps | `tue-mps` | 3 | 0 | **FAIL (ZERO)** |
| Organization | yuhuili | `yuhuili` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ruipeterpan | `ruipeterpan` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Harvard-DCML | `harvard-dcml` | 3 | 0 | **FAIL (ZERO)** |
| Organization | Jinyang23 | `jinyang23` | 3 | 0 | **FAIL (ZERO)** |
| Organization | mhndayesh | `mhndayesh` | 3 | 0 | **FAIL (ZERO)** |
| Organization | inclusionAI | `inclusionai` | 3 | 4 | **POPULATED** |
| Organization | psp-dada | `psp-dada` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ModalityDance | `modalitydance` | 3 | 0 | **FAIL (ZERO)** |
| Organization | timm | `timm` | 3 | 0 | **FAIL (ZERO)** |
| Organization | zhixuan-lin | `zhixuan-lin` | 3 | 0 | **FAIL (ZERO)** |
| Organization | seungyoonee | `seungyoonee` | 3 | 0 | **FAIL (ZERO)** |
| Organization | maelic | `maelic` | 3 | 0 | **FAIL (ZERO)** |
| Organization | TingchenFu | `tingchenfu` | 3 | 0 | **FAIL (ZERO)** |
| Organization | fastino | `fastino` | 3 | 0 | **FAIL (ZERO)** |
| Organization | mapo80 | `mapo80` | 3 | 0 | **FAIL (ZERO)** |
| Organization | nnActive | `nnactive` | 3 | 0 | **FAIL (ZERO)** |
| Organization | liushiliushi | `liushiliushi` | 3 | 0 | **FAIL (ZERO)** |
| Organization | jingyaogong | `jingyaogong` | 3 | 0 | **FAIL (ZERO)** |
| Organization | dongguanting | `dongguanting` | 3 | 0 | **FAIL (ZERO)** |
| Organization | sofieneb | `sofieneb` | 3 | 0 | **FAIL (ZERO)** |
| Organization | ByteDance-Seed | `bytedance-seed` | 3 | 0 | **FAIL (ZERO)** |
| Organization | nota-ai | `nota-ai` | 2 | 0 | **FAIL (ZERO)** |
| Organization | dmolino | `dmolino` | 2 | 0 | **FAIL (ZERO)** |
| Organization | liuwenhan | `liuwenhan` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Video-R1 | `video-r1` | 2 | 0 | **FAIL (ZERO)** |
| Organization | upstage | `upstage` | 2 | 3 | **POPULATED** |
| Organization | mit-oasys | `mit-oasys` | 2 | 0 | **FAIL (ZERO)** |
| Organization | diantoudefengshan | `diantoudefengshan` | 2 | 0 | **FAIL (ZERO)** |
| Organization | ghost233lism | `ghost233lism` | 2 | 0 | **FAIL (ZERO)** |
| Organization | unsloth | `unsloth` | 2 | 0 | **FAIL (ZERO)** |
| Organization | PKU-Wu-Lab | `pku-wu-lab` | 2 | 0 | **FAIL (ZERO)** |
| Organization | openchat | `openchat` | 2 | 0 | **FAIL (ZERO)** |
| Organization | OpenMOSS-Team | `openmoss-team` | 2 | 0 | **FAIL (ZERO)** |
| Organization | hi-paris | `hi-paris` | 2 | 0 | **FAIL (ZERO)** |
| Organization | zhudi2825 | `zhudi2825` | 2 | 0 | **FAIL (ZERO)** |
| Organization | kfdong | `kfdong` | 2 | 0 | **FAIL (ZERO)** |
| Organization | HaochenWang | `haochenwang` | 2 | 0 | **FAIL (ZERO)** |
| Organization | yolay | `yolay` | 2 | 0 | **FAIL (ZERO)** |
| Organization | pixas | `pixas` | 2 | 0 | **FAIL (ZERO)** |
| Organization | WangYipu2002 | `wangyipu2002` | 2 | 0 | **FAIL (ZERO)** |
| Organization | kyutai | `kyutai` | 2 | 0 | **FAIL (ZERO)** |
| Organization | yuanqianhao | `yuanqianhao` | 2 | 0 | **FAIL (ZERO)** |
| Organization | RoyYang0714 | `royyang0714` | 2 | 0 | **FAIL (ZERO)** |
| Organization | PaddlePaddle | `paddlepaddle` | 2 | 0 | **FAIL (ZERO)** |
| Organization | BiliSakura | `bilisakura` | 2 | 0 | **FAIL (ZERO)** |
| Organization | KE-Team | `ke-team` | 2 | 0 | **FAIL (ZERO)** |
| Organization | qihoo360 | `qihoo360` | 2 | 0 | **FAIL (ZERO)** |
| Organization | MaxyLee | `maxylee` | 2 | 0 | **FAIL (ZERO)** |
| Organization | speakleash | `speakleash` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Catalan258 | `catalan258` | 2 | 0 | **FAIL (ZERO)** |
| Organization | yyfz233 | `yyfz233` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Tongyi-MiA | `tongyi-mia` | 2 | 0 | **FAIL (ZERO)** |
| Organization | joooelw | `joooelw` | 2 | 0 | **FAIL (ZERO)** |
| Organization | PLM-Team | `plm-team` | 2 | 0 | **FAIL (ZERO)** |
| Organization | hudsongouge | `hudsongouge` | 2 | 0 | **FAIL (ZERO)** |
| Organization | wangfuyun | `wangfuyun` | 2 | 0 | **FAIL (ZERO)** |
| Organization | LCO-Embedding | `lco-embedding` | 2 | 0 | **FAIL (ZERO)** |
| Organization | maksimko123 | `maksimko123` | 2 | 0 | **FAIL (ZERO)** |
| Organization | mPLUG | `mplug` | 2 | 0 | **FAIL (ZERO)** |
| Organization | asdf98 | `asdf98` | 2 | 0 | **FAIL (ZERO)** |
| Organization | MYJOKERML | `myjokerml` | 2 | 0 | **FAIL (ZERO)** |
| Organization | linear-moe-hub | `linear-moe-hub` | 2 | 0 | **FAIL (ZERO)** |
| Organization | H-EmbodVis | `h-embodvis` | 2 | 0 | **FAIL (ZERO)** |
| Organization | sinahmr | `sinahmr` | 2 | 0 | **FAIL (ZERO)** |
| Organization | wusize | `wusize` | 2 | 0 | **FAIL (ZERO)** |
| Organization | hon9kon9ize | `hon9kon9ize` | 2 | 0 | **FAIL (ZERO)** |
| Organization | SiningZhou | `siningzhou` | 2 | 0 | **FAIL (ZERO)** |
| Organization | JimmyBrocko | `jimmybrocko` | 2 | 0 | **FAIL (ZERO)** |
| Organization | GAASH-Lab | `gaash-lab` | 2 | 0 | **FAIL (ZERO)** |
| Organization | redlessone | `redlessone` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Xieji-Li | `xieji-li` | 2 | 0 | **FAIL (ZERO)** |
| Organization | xushu-me | `xushu-me` | 2 | 0 | **FAIL (ZERO)** |
| Organization | TencentBAC | `tencentbac` | 2 | 0 | **FAIL (ZERO)** |
| Organization | ajd12342 | `ajd12342` | 2 | 0 | **FAIL (ZERO)** |
| Organization | yuyijiong | `yuyijiong` | 2 | 0 | **FAIL (ZERO)** |
| Organization | liamsbhoo | `liamsbhoo` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Bruece | `bruece` | 2 | 0 | **FAIL (ZERO)** |
| Organization | KlingTeam | `klingteam` | 2 | 0 | **FAIL (ZERO)** |
| Organization | JosephTong | `josephtong` | 2 | 0 | **FAIL (ZERO)** |
| Organization | vantagewithai | `vantagewithai` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Gen-Verse | `gen-verse` | 2 | 0 | **FAIL (ZERO)** |
| Organization | LZXzju | `lzxzju` | 2 | 0 | **FAIL (ZERO)** |
| Organization | FelixKAI | `felixkai` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Goedel-LM | `goedel-lm` | 2 | 0 | **FAIL (ZERO)** |
| Organization | mahmoudibra98 | `mahmoudibra98` | 2 | 0 | **FAIL (ZERO)** |
| Organization | InfiX-ai | `infix-ai` | 2 | 0 | **FAIL (ZERO)** |
| Organization | naver | `naver` | 2 | 0 | **FAIL (ZERO)** |
| Organization | yucongzh | `yucongzh` | 2 | 0 | **FAIL (ZERO)** |
| Organization | jsun39 | `jsun39` | 2 | 0 | **FAIL (ZERO)** |
| Organization | OpenResearcher | `openresearcher` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Schrieffer | `schrieffer` | 2 | 0 | **FAIL (ZERO)** |
| Organization | wayneicloud | `wayneicloud` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Darwin-Project | `darwin-project` | 2 | 0 | **FAIL (ZERO)** |
| Organization | tristan-deep | `tristan-deep` | 2 | 0 | **FAIL (ZERO)** |
| Organization | JSYuuu | `jsyuuu` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Erfan-Nourbakhsh | `erfan-nourbakhsh` | 2 | 0 | **FAIL (ZERO)** |
| Organization | EdwinUstb | `edwinustb` | 2 | 0 | **FAIL (ZERO)** |
| Organization | UserJoseph | `userjoseph` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Intel | `intel` | 2 | 0 | **FAIL (ZERO)** |
| Organization | Vinnnf | `vinnnf` | 2 | 0 | **FAIL (ZERO)** |
| Organization | bond005 | `bond005` | 2 | 0 | **FAIL (ZERO)** |
| Organization | SnowCharmQ | `snowcharmq` | 1 | 0 | **FAIL (ZERO)** |
| Organization | rp-yu | `rp-yu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AshenNav | `ashennav` | 1 | 0 | **FAIL (ZERO)** |
| Organization | SteveZh | `stevezh` | 1 | 0 | **FAIL (ZERO)** |
| Organization | tsinghua-ee | `tsinghua-ee` | 1 | 0 | **FAIL (ZERO)** |
| Organization | blackhao0426 | `blackhao0426` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Falconss1 | `falconss1` | 1 | 0 | **FAIL (ZERO)** |
| Organization | zibuyu-02 | `zibuyu-02` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Intelligent-Internet | `intelligent-internet` | 1 | 0 | **FAIL (ZERO)** |
| Organization | QuantFactory | `quantfactory` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Databricks | `databricks` | 1 | 0 | **FAIL (ZERO)** |
| Organization | frozen2001 | `frozen2001` | 1 | 0 | **FAIL (ZERO)** |
| Organization | poolside-laguna-hackathon | `poolside-laguna-hackathon` | 1 | 0 | **FAIL (ZERO)** |
| Organization | HeinzJiao | `heinzjiao` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Peisheng | `peisheng` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Luuvy | `luuvy` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Voxel51 | `voxel51` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xiaoqi-wang | `xiaoqi-wang` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Aqarion | `aqarion` | 1 | 0 | **FAIL (ZERO)** |
| Organization | DingZhenDojoCat | `dingzhendojocat` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xushuwen23 | `xushuwen23` | 1 | 0 | **FAIL (ZERO)** |
| Organization | nightmedia | `nightmedia` | 1 | 0 | **FAIL (ZERO)** |
| Organization | coolbeam | `coolbeam` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Wherebot101 | `wherebot101` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Kwai-Kolors | `kwai-kolors` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AnnaGao | `annagao` | 1 | 0 | **FAIL (ZERO)** |
| Organization | rvandeghen | `rvandeghen` | 1 | 0 | **FAIL (ZERO)** |
| Organization | onecat-ai | `onecat-ai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | meituan-longcat | `meituan-longcat` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Artificial-Production-Units | `artificial-production-units` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Artificial-Development-Studios | `artificial-development-studios` | 1 | 0 | **FAIL (ZERO)** |
| Organization | TahaKoleilat | `tahakoleilat` | 1 | 0 | **FAIL (ZERO)** |
| Organization | KitsuVp | `kitsuvp` | 1 | 0 | **FAIL (ZERO)** |
| Organization | nics-efc | `nics-efc` | 1 | 0 | **FAIL (ZERO)** |
| Organization | pf0607 | `pf0607` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Marco711 | `marco711` | 1 | 0 | **FAIL (ZERO)** |
| Organization | arubique | `arubique` | 1 | 0 | **FAIL (ZERO)** |
| Organization | GD-ML | `gd-ml` | 1 | 0 | **FAIL (ZERO)** |
| Organization | LichengLiu03 | `lichengliu03` | 1 | 0 | **FAIL (ZERO)** |
| Organization | tutu0604 | `tutu0604` | 1 | 0 | **FAIL (ZERO)** |
| Organization | abdurrahimyilmaz | `abdurrahimyilmaz` | 1 | 0 | **FAIL (ZERO)** |
| Organization | JamyDohrn | `jamydohrn` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ebayar | `ebayar` | 1 | 0 | **FAIL (ZERO)** |
| Organization | MengqiLei | `mengqilei` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jimmygao3218 | `jimmygao3218` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ryanfortin | `ryanfortin` | 1 | 0 | **FAIL (ZERO)** |
| Organization | nassimaODL | `nassimaodl` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Zkkkai | `zkkkai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | medarc | `medarc` | 1 | 0 | **FAIL (ZERO)** |
| Organization | typhoon-ai | `typhoon-ai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Levideus | `levideus` | 1 | 0 | **FAIL (ZERO)** |
| Organization | PrimeBo1 | `primebo1` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ChongCong | `chongcong` | 1 | 0 | **FAIL (ZERO)** |
| Organization | kevin0311 | `kevin0311` | 1 | 0 | **FAIL (ZERO)** |
| Organization | m-Just | `m-just` | 1 | 0 | **FAIL (ZERO)** |
| Organization | predictive-maintenance | `predictive-maintenance` | 1 | 0 | **FAIL (ZERO)** |
| Organization | henryhe0123 | `henryhe0123` | 1 | 0 | **FAIL (ZERO)** |
| Organization | wuuuuuz | `wuuuuuz` | 1 | 0 | **FAIL (ZERO)** |
| Organization | danish-foundation-models | `danish-foundation-models` | 1 | 0 | **FAIL (ZERO)** |
| Organization | WG-KV | `wg-kv` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Simmonstt | `simmonstt` | 1 | 0 | **FAIL (ZERO)** |
| Organization | netease-youdao | `netease-youdao` | 1 | 0 | **FAIL (ZERO)** |
| Organization | vvangfaye | `vvangfaye` | 1 | 0 | **FAIL (ZERO)** |
| Organization | wangzeze | `wangzeze` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jsookim | `jsookim` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Acellera | `acellera` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Joyjeetsingh | `joyjeetsingh` | 1 | 0 | **FAIL (ZERO)** |
| Organization | WuqnEl | `wuqnel` | 1 | 0 | **FAIL (ZERO)** |
| Organization | MayaKD | `mayakd` | 1 | 0 | **FAIL (ZERO)** |
| Organization | siyiwind | `siyiwind` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Hugo0713 | `hugo0713` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ddgoodgood | `ddgoodgood` | 1 | 0 | **FAIL (ZERO)** |
| Organization | oonat | `oonat` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Builder-Neekhil | `builder-neekhil` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ATH-MaaS | `ath-maas` | 1 | 0 | **FAIL (ZERO)** |
| Organization | maya-multimodal | `maya-multimodal` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Junwei-Xi | `junwei-xi` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xRayon | `xrayon` | 1 | 0 | **FAIL (ZERO)** |
| Organization | iamkuba | `iamkuba` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AmayaGS | `amayags` | 1 | 0 | **FAIL (ZERO)** |
| Organization | lvyufeng | `lvyufeng` | 1 | 0 | **FAIL (ZERO)** |
| Organization | minghaofdu | `minghaofdu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Zigeng | `zigeng` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Dingyi111 | `dingyi111` | 1 | 0 | **FAIL (ZERO)** |
| Organization | mispeech | `mispeech` | 1 | 0 | **FAIL (ZERO)** |
| Organization | saqialii | `saqialii` | 1 | 0 | **FAIL (ZERO)** |
| Organization | akhauriyash | `akhauriyash` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Alwahsh | `alwahsh` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Davidup1 | `davidup1` | 1 | 0 | **FAIL (ZERO)** |
| Organization | roujin | `roujin` | 1 | 0 | **FAIL (ZERO)** |
| Organization | StarNew | `starnew` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xinyiW915 | `xinyiw915` | 1 | 0 | **FAIL (ZERO)** |
| Organization | aydnarda | `aydnarda` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ai4colonoscopy | `ai4colonoscopy` | 1 | 0 | **FAIL (ZERO)** |
| Organization | fishaudio | `fishaudio` | 1 | 0 | **FAIL (ZERO)** |
| Organization | mlx-community | `mlx-community` | 1 | 0 | **FAIL (ZERO)** |
| Organization | drbaph | `drbaph` | 1 | 0 | **FAIL (ZERO)** |
| Organization | sst12345 | `sst12345` | 1 | 0 | **FAIL (ZERO)** |
| Organization | SUFE-AIFLM-Lab | `sufe-aiflm-lab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | z0n3x | `z0n3x` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Daemons-Q | `daemons-q` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Oscar-dzy | `oscar-dzy` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Luo-Yihong | `luo-yihong` | 1 | 0 | **FAIL (ZERO)** |
| Organization | IAAR-Shanghai | `iaar-shanghai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | pasqualedem | `pasqualedem` | 1 | 0 | **FAIL (ZERO)** |
| Organization | websystemspl | `websystemspl` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ajh-code | `ajh-code` | 1 | 0 | **FAIL (ZERO)** |
| Organization | wheattoast11 | `wheattoast11` | 1 | 0 | **FAIL (ZERO)** |
| Organization | sand-ai | `sand-ai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Guomh0707 | `guomh0707` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Haotian-sx | `haotian-sx` | 1 | 0 | **FAIL (ZERO)** |
| Organization | wifibk | `wifibk` | 1 | 0 | **FAIL (ZERO)** |
| Organization | OP12138 | `op12138` | 1 | 0 | **FAIL (ZERO)** |
| Organization | scrappylabsai | `scrappylabsai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | s23deepak | `s23deepak` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ZhiyuanthePony | `zhiyuanthepony` | 1 | 0 | **FAIL (ZERO)** |
| Organization | tianlezeng | `tianlezeng` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Doctor-James | `doctor-james` | 1 | 0 | **FAIL (ZERO)** |
| Organization | chengwenxuan7 | `chengwenxuan7` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AFatRat | `afatrat` | 1 | 0 | **FAIL (ZERO)** |
| Organization | henry-pay | `henry-pay` | 1 | 0 | **FAIL (ZERO)** |
| Organization | nerds-gaming | `nerds-gaming` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Jessie459 | `jessie459` | 1 | 0 | **FAIL (ZERO)** |
| Organization | gustavlangstroem | `gustavlangstroem` | 1 | 0 | **FAIL (ZERO)** |
| Organization | PulpBio | `pulpbio` | 1 | 0 | **FAIL (ZERO)** |
| Organization | fdsajkshf | `fdsajkshf` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Cierra0506 | `cierra0506` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Kfkcome | `kfkcome` | 1 | 0 | **FAIL (ZERO)** |
| Organization | PauMontagut | `paumontagut` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Y-Tarl | `y-tarl` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ZQTTTT | `zqtttt` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AuroraZengfh | `aurorazengfh` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Feargal | `feargal` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ytgui | `ytgui` | 1 | 0 | **FAIL (ZERO)** |
| Organization | MashiroLn | `mashiroln` | 1 | 0 | **FAIL (ZERO)** |
| Organization | marksverdhei | `marksverdhei` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ValentinLAFARGUE | `valentinlafargue` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Lu9876 | `lu9876` | 1 | 0 | **FAIL (ZERO)** |
| Organization | YijunLiao | `yijunliao` | 1 | 0 | **FAIL (ZERO)** |
| Organization | rethinklab | `rethinklab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Telkwevr | `telkwevr` | 1 | 0 | **FAIL (ZERO)** |
| Organization | yangnianzu | `yangnianzu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Lotior | `lotior` | 1 | 0 | **FAIL (ZERO)** |
| Organization | opendatalab | `opendatalab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Longin-Yu | `longin-yu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | superkenvery | `superkenvery` | 1 | 0 | **FAIL (ZERO)** |
| Organization | nicolashoudre | `nicolashoudre` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Thatmakes11 | `thatmakes11` | 1 | 0 | **FAIL (ZERO)** |
| Organization | roufaen | `roufaen` | 1 | 0 | **FAIL (ZERO)** |
| Organization | SKwra | `skwra` | 1 | 0 | **FAIL (ZERO)** |
| Organization | not-a-feature | `not-a-feature` | 1 | 0 | **FAIL (ZERO)** |
| Organization | liu123-2 | `liu123-2` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Yuheng02 | `yuheng02` | 1 | 0 | **FAIL (ZERO)** |
| Organization | zengyb6666 | `zengyb6666` | 1 | 0 | **FAIL (ZERO)** |
| Organization | QCRI | `qcri` | 1 | 0 | **FAIL (ZERO)** |
| Organization | UEmmanuel5 | `uemmanuel5` | 1 | 0 | **FAIL (ZERO)** |
| Organization | hyperkit | `hyperkit` | 1 | 0 | **FAIL (ZERO)** |
| Organization | hyf015 | `hyf015` | 1 | 0 | **FAIL (ZERO)** |
| Organization | yfcai | `yfcai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jhartquist | `jhartquist` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Student-Xiaoji | `student-xiaoji` | 1 | 0 | **FAIL (ZERO)** |
| Organization | zhiyuandaily | `zhiyuandaily` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Jiakui | `jiakui` | 1 | 0 | **FAIL (ZERO)** |
| Organization | shufanshen | `shufanshen` | 1 | 0 | **FAIL (ZERO)** |
| Organization | HorizonRobotics | `horizonrobotics` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ScottHan | `scotthan` | 1 | 0 | **FAIL (ZERO)** |
| Organization | FlashLabs | `flashlabs` | 1 | 0 | **FAIL (ZERO)** |
| Organization | maomao0819 | `maomao0819` | 1 | 0 | **FAIL (ZERO)** |
| Organization | vl4gh7 | `vl4gh7` | 1 | 0 | **FAIL (ZERO)** |
| Organization | lemuelpuglisi | `lemuelpuglisi` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AIGeeksGroup | `aigeeksgroup` | 1 | 0 | **FAIL (ZERO)** |
| Organization | lycnight | `lycnight` | 1 | 0 | **FAIL (ZERO)** |
| Organization | bakhshaliyev | `bakhshaliyev` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AbijahKaj | `abijahkaj` | 1 | 0 | **FAIL (ZERO)** |
| Organization | mmthinking | `mmthinking` | 1 | 0 | **FAIL (ZERO)** |
| Organization | DempseyWen | `dempseywen` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ZrH42 | `zrh42` | 1 | 0 | **FAIL (ZERO)** |
| Organization | IronKitty | `ironkitty` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Edaizi | `edaizi` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ycwu97 | `ycwu97` | 1 | 0 | **FAIL (ZERO)** |
| Organization | IQuestLab | `iquestlab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | MariaLarchenko | `marialarchenko` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ivnle | `ivnle` | 1 | 0 | **FAIL (ZERO)** |
| Organization | wudq | `wudq` | 1 | 0 | **FAIL (ZERO)** |
| Organization | HAI-Lab | `hai-lab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | fudan-generative-ai | `fudan-generative-ai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | LEONW24 | `leonw24` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Zomba | `zomba` | 1 | 0 | **FAIL (ZERO)** |
| Organization | yscript | `yscript` | 1 | 0 | **FAIL (ZERO)** |
| Organization | zhiqing0205 | `zhiqing0205` | 1 | 0 | **FAIL (ZERO)** |
| Organization | egeozsoy | `egeozsoy` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ardamamur | `ardamamur` | 1 | 0 | **FAIL (ZERO)** |
| Organization | SimulaMet | `simulamet` | 1 | 0 | **FAIL (ZERO)** |
| Organization | encoreus | `encoreus` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jaeunglee | `jaeunglee` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ushah | `ushah` | 1 | 0 | **FAIL (ZERO)** |
| Organization | DanielPFlorian | `danielpflorian` | 1 | 0 | **FAIL (ZERO)** |
| Organization | LilShake66 | `lilshake66` | 1 | 0 | **FAIL (ZERO)** |
| Organization | W-Shuoyan | `w-shuoyan` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Enxin | `enxin` | 1 | 0 | **FAIL (ZERO)** |
| Organization | singhlab | `singhlab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | dtc111 | `dtc111` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Ursulalala | `ursulalala` | 1 | 0 | **FAIL (ZERO)** |
| Organization | WaltonFuture | `waltonfuture` | 1 | 0 | **FAIL (ZERO)** |
| Organization | mkjia | `mkjia` | 1 | 0 | **FAIL (ZERO)** |
| Organization | XXXXing | `xxxxing` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jt-zhang | `jt-zhang` | 1 | 0 | **FAIL (ZERO)** |
| Organization | erjui | `erjui` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Susav | `susav` | 1 | 0 | **FAIL (ZERO)** |
| Organization | iliasslasri | `iliasslasri` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xypkent | `xypkent` | 1 | 0 | **FAIL (ZERO)** |
| Organization | goals4292 | `goals4292` | 1 | 0 | **FAIL (ZERO)** |
| Organization | raman07 | `raman07` | 1 | 0 | **FAIL (ZERO)** |
| Organization | genesisml | `genesisml` | 1 | 0 | **FAIL (ZERO)** |
| Organization | smthem | `smthem` | 1 | 0 | **FAIL (ZERO)** |
| Organization | sp12138sp | `sp12138sp` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xuyicheng-zju | `xuyicheng-zju` | 1 | 0 | **FAIL (ZERO)** |
| Organization | MUG-V | `mug-v` | 1 | 0 | **FAIL (ZERO)** |
| Organization | showlab | `showlab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | PKU-DS-LAB | `pku-ds-lab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Gnonymous | `gnonymous` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Layer6 | `layer6` | 1 | 0 | **FAIL (ZERO)** |
| Organization | MIC-DKFZ | `mic-dkfz` | 1 | 0 | **FAIL (ZERO)** |
| Organization | aurevyn | `aurevyn` | 1 | 0 | **FAIL (ZERO)** |
| Organization | tangqh | `tangqh` | 1 | 0 | **FAIL (ZERO)** |
| Organization | elyhahami | `elyhahami` | 1 | 0 | **FAIL (ZERO)** |
| Organization | vocaela | `vocaela` | 1 | 0 | **FAIL (ZERO)** |
| Organization | RL-MIND | `rl-mind` | 1 | 0 | **FAIL (ZERO)** |
| Organization | deokhk | `deokhk` | 1 | 0 | **FAIL (ZERO)** |
| Organization | laicsiifes | `laicsiifes` | 1 | 0 | **FAIL (ZERO)** |
| Organization | NP235 | `np235` | 1 | 0 | **FAIL (ZERO)** |
| Organization | mli-lab | `mli-lab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | LY-Xie | `ly-xie` | 1 | 0 | **FAIL (ZERO)** |
| Organization | echo840 | `echo840` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Avatarr05 | `avatarr05` | 1 | 0 | **FAIL (ZERO)** |
| Organization | mirpri | `mirpri` | 1 | 0 | **FAIL (ZERO)** |
| Organization | FlowVortex | `flowvortex` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Rabornkraken | `rabornkraken` | 1 | 0 | **FAIL (ZERO)** |
| Organization | future7 | `future7` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Sravanth18 | `sravanth18` | 1 | 0 | **FAIL (ZERO)** |
| Organization | WenchuanZhang | `wenchuanzhang` | 1 | 0 | **FAIL (ZERO)** |
| Organization | claudaff | `claudaff` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Bubenpo | `bubenpo` | 1 | 0 | **FAIL (ZERO)** |
| Organization | kei-saito-research | `kei-saito-research` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jeffchanpm | `jeffchanpm` | 1 | 0 | **FAIL (ZERO)** |
| Organization | pudashi | `pudashi` | 1 | 0 | **FAIL (ZERO)** |
| Organization | I0u0I | `i0u0i` | 1 | 0 | **FAIL (ZERO)** |
| Organization | iLearn-Lab | `ilearn-lab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | lixiaoxi45 | `lixiaoxi45` | 1 | 0 | **FAIL (ZERO)** |
| Organization | topdu | `topdu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | yctao | `yctao` | 1 | 0 | **FAIL (ZERO)** |
| Organization | JunlongTong | `junlongtong` | 1 | 0 | **FAIL (ZERO)** |
| Organization | krystv | `krystv` | 1 | 0 | **FAIL (ZERO)** |
| Organization | farzadbz | `farzadbz` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Authereon | `authereon` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Junteng | `junteng` | 1 | 0 | **FAIL (ZERO)** |
| Organization | General-Medical-AI | `general-medical-ai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | vdhanraj | `vdhanraj` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xing0916 | `xing0916` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Xuerui123 | `xuerui123` | 1 | 0 | **FAIL (ZERO)** |
| Organization | YiminJimmy | `yiminjimmy` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Xuanlong | `xuanlong` | 1 | 0 | **FAIL (ZERO)** |
| Organization | UmiSonoda16 | `umisonoda16` | 1 | 0 | **FAIL (ZERO)** |
| Organization | javrtg | `javrtg` | 1 | 0 | **FAIL (ZERO)** |
| Organization | sinaalemohammad | `sinaalemohammad` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Ryukijano | `ryukijano` | 1 | 0 | **FAIL (ZERO)** |
| Organization | barpitf | `barpitf` | 1 | 0 | **FAIL (ZERO)** |
| Organization | JorgeAV | `jorgeav` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ShubhamRasal | `shubhamrasal` | 1 | 0 | **FAIL (ZERO)** |
| Organization | ashwath-vaithina | `ashwath-vaithina` | 1 | 0 | **FAIL (ZERO)** |
| Organization | SunXiang2025 | `sunxiang2025` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Ach0 | `ach0` | 1 | 0 | **FAIL (ZERO)** |
| Organization | flow666 | `flow666` | 1 | 0 | **FAIL (ZERO)** |
| Organization | s1ghhh | `s1ghhh` | 1 | 0 | **FAIL (ZERO)** |
| Organization | dunnolab | `dunnolab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Camsouille | `camsouille` | 1 | 0 | **FAIL (ZERO)** |
| Organization | songziwei | `songziwei` | 1 | 0 | **FAIL (ZERO)** |
| Organization | fatemehdoudi97 | `fatemehdoudi97` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Wenhao-Sun | `wenhao-sun` | 1 | 0 | **FAIL (ZERO)** |
| Organization | caiovicentino1 | `caiovicentino1` | 1 | 0 | **FAIL (ZERO)** |
| Organization | heejokong | `heejokong` | 1 | 0 | **FAIL (ZERO)** |
| Organization | fzzsl | `fzzsl` | 1 | 0 | **FAIL (ZERO)** |
| Organization | pihaisun | `pihaisun` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Yumic | `yumic` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xingshen | `xingshen` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xhLiu | `xhliu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | weilllllls | `weilllllls` | 1 | 0 | **FAIL (ZERO)** |
| Organization | YuePanEdward | `yuepanedward` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jenso | `jenso` | 1 | 0 | **FAIL (ZERO)** |
| Organization | yxdu | `yxdu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | zjhhhh | `zjhhhh` | 1 | 0 | **FAIL (ZERO)** |
| Organization | pirola | `pirola` | 1 | 0 | **FAIL (ZERO)** |
| Organization | lahaina | `lahaina` | 1 | 0 | **FAIL (ZERO)** |
| Organization | zty557 | `zty557` | 1 | 0 | **FAIL (ZERO)** |
| Organization | yayafengzi | `yayafengzi` | 1 | 0 | **FAIL (ZERO)** |
| Organization | OpenTSLab | `opentslab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | jeffrey423 | `jeffrey423` | 1 | 0 | **FAIL (ZERO)** |
| Organization | FengheTan9 | `fenghetan9` | 1 | 0 | **FAIL (ZERO)** |
| Organization | XiangpengYang | `xiangpengyang` | 1 | 0 | **FAIL (ZERO)** |
| Organization | mtri-admin | `mtri-admin` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Yassaman | `yassaman` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Thrillcrazyer | `thrillcrazyer` | 1 | 0 | **FAIL (ZERO)** |
| Organization | zeyuren2002 | `zeyuren2002` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Jakir057 | `jakir057` | 1 | 0 | **FAIL (ZERO)** |
| Organization | HOLILAB | `holilab` | 1 | 0 | **FAIL (ZERO)** |
| Organization | lucaeyring | `lucaeyring` | 1 | 0 | **FAIL (ZERO)** |
| Organization | QwenQKing | `qwenqking` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Insta360-Research | `insta360-research` | 1 | 0 | **FAIL (ZERO)** |
| Organization | kujimili | `kujimili` | 1 | 0 | **FAIL (ZERO)** |
| Organization | anhquancao | `anhquancao` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Ophil | `ophil` | 1 | 0 | **FAIL (ZERO)** |
| Organization | lioooox | `lioooox` | 1 | 0 | **FAIL (ZERO)** |
| Organization | codefuse-ai | `codefuse-ai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | theLittleStone | `thelittlestone` | 1 | 0 | **FAIL (ZERO)** |
| Organization | AEON-7 | `aeon-7` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Confetti | `confetti` | 1 | 0 | **FAIL (ZERO)** |
| Organization | SerezD | `serezd` | 1 | 0 | **FAIL (ZERO)** |
| Organization | albrateanu | `albrateanu` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Chikap421 | `chikap421` | 1 | 0 | **FAIL (ZERO)** |
| Organization | LigandPro | `ligandpro` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Owkin-Bioptimus | `owkin-bioptimus` | 1 | 0 | **FAIL (ZERO)** |
| Organization | EasonXiao-888 | `easonxiao-888` | 1 | 0 | **FAIL (ZERO)** |
| Organization | Spongebobbbbbbbb | `spongebobbbbbbbb` | 1 | 0 | **FAIL (ZERO)** |
| Organization | SparkAudio | `sparkaudio` | 1 | 0 | **FAIL (ZERO)** |
| Organization | MrEzzat | `mrezzat` | 1 | 0 | **FAIL (ZERO)** |
| Organization | glory947446 | `glory947446` | 1 | 0 | **FAIL (ZERO)** |
| Organization | JimmyMa99 | `jimmyma99` | 1 | 0 | **FAIL (ZERO)** |
| Organization | xsssqqqqxx | `xsssqqqqxx` | 1 | 0 | **FAIL (ZERO)** |
| Organization | RationAI | `rationai` | 1 | 0 | **FAIL (ZERO)** |
| Organization | qian43 | `qian43` | 1 | 0 | **FAIL (ZERO)** |
| Organization | markus-42 | `markus-42` | 1 | 0 | **FAIL (ZERO)** |
| Organization | yuUnuo | `yuunuo` | 1 | 0 | **FAIL (ZERO)** |
| Organization | FSCCS | `fsccs` | 1 | 0 | **FAIL (ZERO)** |
| Organization | meteorite2023 | `meteorite2023` | 1 | 0 | **FAIL (ZERO)** |
| Organization | KryptykAngel | `kryptykangel` | 1 | 0 | **FAIL (ZERO)** |
| Research Area | Large Language Models | `large-language-models` | 571 | 0 | **FAIL (ZERO)** |
| Research Area | Reasoning | `reasoning` | 441 | 335 | **POPULATED** |
| Research Area | Code Intelligence | `code-intelligence` | 425 | 0 | **FAIL (ZERO)** |
| Research Area | Multimodal AI | `multimodal-ai` | 149 | 0 | **FAIL (ZERO)** |
| Research Area | Computer Vision | `computer-vision` | 86 | 0 | **FAIL (ZERO)** |
| Research Area | Translation | `translation` | 66 | 0 | **FAIL (ZERO)** |
| Research Area | Audio | `audio` | 35 | 44 | **POPULATED** |
| Research Area | Document AI | `document-ai` | 34 | 0 | **FAIL (ZERO)** |
| Research Area | OCR | `ocr` | 33 | 0 | **FAIL (ZERO)** |
| Research Area | Speech | `speech` | 32 | 0 | **FAIL (ZERO)** |
| Research Area | Agentic AI | `agentic-ai` | 20 | 0 | **FAIL (ZERO)** |
| Research Area | Mathematics | `mathematics` | 17 | 0 | **FAIL (ZERO)** |
| Research Area | Time Series | `time-series` | 13 | 0 | **FAIL (ZERO)** |
| Research Area | Search & Retrieval | `search-retrieval` | 12 | 0 | **FAIL (ZERO)** |
| Research Area | Planning | `planning` | 5 | 0 | **FAIL (ZERO)** |
| Research Area | Healthcare AI | `healthcare-ai` | 4 | 0 | **FAIL (ZERO)** |
| Research Area | Embodied AI | `embodied-ai` | 3 | 0 | **FAIL (ZERO)** |
| Research Area | Reinforcement Learning | `reinforcement-learning` | 3 | 0 | **FAIL (ZERO)** |
| Research Area | Graph Learning | `graph-learning` | 2 | 0 | **FAIL (ZERO)** |
| Research Area | Scientific AI | `scientific-ai` | 1 | 0 | **FAIL (ZERO)** |
| Research Area | Recommendation Systems | `recommendation-systems` | 1 | 0 | **FAIL (ZERO)** |
| Curated | Trending | `trending` | N/A | 0 | **FAIL (ZERO)** |
| Curated | Recently Released | `recent` | N/A | 0 | **FAIL (ZERO)** |
| Curated | Reasoning | `reasoning` | N/A | 335 | **POPULATED** |
| Curated | Multimodal | `multimodal` | N/A | 0 | **FAIL (ZERO)** |
| Curated | Open Weights | `open-weights` | N/A | 0 | **FAIL (ZERO)** |
| Curated | Proprietary | `proprietary` | N/A | 0 | **FAIL (ZERO)** |

## Summary

- **Total Cards Audited**: 670
- **Populated Cards**: 45
- **Failing / Empty Cards (0 models)**: 625 (93.3%)
