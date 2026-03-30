/**
 * 知识星图 - 后端服务
 * Express + JSON 文件存储，支持多用户共享数据
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 7788;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = __dirname;

// ── 初始化数据文件 ──────────────────────────────────
const DEFAULT_DATA = {
  nodes: [
    { id:'llm',      cat:'ai',      icon:'🧠', name:'大语言模型',    status:'mastered', desc:'GPT、Claude、Gemini等主流LLM的原理、能力边界与应用场景，包括prompt工程、上下文管理。',                   tags:['LLM','Prompt','RAG','Transformer'] },
    { id:'ai-agent', cat:'ai',      icon:'🤖', name:'AI Agent',      status:'mastered', desc:'基于大模型的自主智能体，能够规划、调用工具、执行多步任务，是AI Coding和自动化的核心范式。',             tags:['Agent','Tool Use','Planning','AutoGPT'] },
    { id:'rag',      cat:'ai',      icon:'🔍', name:'RAG检索增强',   status:'learning', desc:'通过向量检索将外部知识注入LLM，解决幻觉问题和知识截止问题，构建个人知识库的关键技术。',                tags:['RAG','向量数据库','Embedding','知识库'] },
    { id:'ai-img',   cat:'ai',      icon:'🎨', name:'AI图像生成',    status:'mastered', desc:'Midjourney、Flux、DALL-E等文生图模型的提示词工程、风格控制、图像编辑技术。',                            tags:['Midjourney','Flux','Stable Diffusion','提示词'] },
    { id:'ai-video', cat:'ai',      icon:'🎬', name:'AI视频生成',    status:'learning', desc:'Sora、Runway、可灵等AI视频生成工具，分镜提示词设计，用于短剧/内容创作流程。',                            tags:['Sora','Runway','分镜','文生视频'] },
    { id:'ai-coding',cat:'ai',      icon:'💻', name:'AI Coding',     status:'mastered', desc:'GitHub Copilot、Cursor、Claude Code等AI编程工具的使用，以及Vibe Coding工作流。',                         tags:['Cursor','Copilot','Vibe Coding','代码生成'] },
    { id:'embodied', cat:'ai',      icon:'🦾', name:'具身智能',      status:'learning', desc:'机器人感知-决策-执行闭环，OpenClaw、Genie Sim等具身AI框架，是AI下一个重要战场。',                       tags:['机器人','具身AI','OPD','仿真训练'] },
    { id:'multi-modal',cat:'ai',    icon:'👁', name:'多模态AI',      status:'learning', desc:'图像+文本+音频+视频的联合理解与生成，是下一代AI交互的基础。',                                              tags:['多模态','Vision','语音','OCR'] },
    { id:'ai-workflow',cat:'ai',    icon:'⚙️', name:'AI工作流',     status:'mastered', desc:'n8n、Dify、Coze等自动化平台，将AI能力组合成可复用的工作流水线。',                                          tags:['n8n','Dify','Coze','自动化'] },
    { id:'fine-tune', cat:'ai',     icon:'🎯', name:'模型微调',      status:'locked',   desc:'LoRA、QLoRA等参数高效微调技术，在特定领域定制专属AI模型。',                                                tags:['LoRA','微调','训练数据','PEFT'] },
    { id:'js',       cat:'coding',  icon:'🟨', name:'JavaScript',    status:'mastered', desc:'Web前端核心语言，ES6+特性，异步编程，DOM操作，是构建现代Web应用的基础。',                                 tags:['ES6','异步','DOM','Node.js'] },
    { id:'react',    cat:'coding',  icon:'⚛️', name:'React',         status:'mastered', desc:'主流前端框架，组件化开发、Hooks、状态管理，构建现代交互式Web应用。',                                       tags:['React','Hooks','组件','状态管理'] },
    { id:'nodejs',   cat:'coding',  icon:'🟩', name:'Node.js',       status:'mastered', desc:'服务端JavaScript运行时，构建API服务、自动化脚本、后端应用。',                                               tags:['Node.js','npm','API','后端'] },
    { id:'python',   cat:'coding',  icon:'🐍', name:'Python',        status:'learning', desc:'AI/数据科学最主流语言，数据处理、自动化脚本、机器学习接口。',                                              tags:['Python','pip','数据处理','自动化'] },
    { id:'html-css', cat:'coding',  icon:'🎨', name:'HTML/CSS',      status:'mastered', desc:'Web基础技术，语义化HTML、Flexbox、Grid布局、动画效果、响应式设计。',                                       tags:['HTML','CSS','Flexbox','Grid'] },
    { id:'git',      cat:'coding',  icon:'🌿', name:'Git/版本控制',  status:'mastered', desc:'代码版本管理、协作开发、分支策略，是现代开发工作流的基础。',                                               tags:['Git','GitHub','分支','PR'] },
    { id:'api',      cat:'coding',  icon:'🔌', name:'API集成',       status:'mastered', desc:'RESTful API设计与调用、第三方服务接入、Webhook、OAuth认证。',                                               tags:['REST','API','Webhook','OAuth'] },
    { id:'database', cat:'coding',  icon:'🗄', name:'数据库',        status:'learning', desc:'SQL/NoSQL数据库设计，Supabase、MongoDB等现代数据库服务的使用。',                                            tags:['SQL','Supabase','MongoDB','数据建模'] },
    { id:'deploy',   cat:'coding',  icon:'🚀', name:'部署/云服务',   status:'learning', desc:'Vercel、腾讯云等云平台部署，CI/CD自动化，服务器运维基础。',                                                tags:['Vercel','云服务','CI/CD','Docker'] },
    { id:'miniapp',  cat:'coding',  icon:'📱', name:'微信小程序',    status:'learning', desc:'微信小程序开发框架、云开发、组件体系，面向中国市场的应用开发。',                                            tags:['小程序','云开发','WXML','WeUI'] },
    { id:'shot-comp',cat:'film',    icon:'📐', name:'镜头构图',      status:'mastered', desc:'黄金分割、三分法、对称构图、引导线等构图原则，库布里克对称美学，镜头语言基础。',                          tags:['构图','黄金分割','视觉引导','对称'] },
    { id:'cinemato', cat:'film',    icon:'🎥', name:'摄影运镜',      status:'learning', desc:'推拉摇移跟升降等摄影机运动，焦距选择，景深控制，手持与稳定器的运用。',                                    tags:['运镜','焦距','景深','摄影机'] },
    { id:'editing',  cat:'film',    icon:'✂️', name:'剪辑节奏',     status:'learning', desc:'叙事剪辑逻辑、节奏把控、转场技法、音画关系，如何用剪辑讲故事。',                                           tags:['剪辑','节奏','转场','叙事'] },
    { id:'script',   cat:'film',    icon:'📝', name:'剧本创作',      status:'mastered', desc:'三幕结构、人物弧光、对白写作、场景描述，商业类型片剧本的结构与法则。',                                     tags:['剧本','三幕式','人物弧','对白'] },
    { id:'storyboard',cat:'film',   icon:'🎞', name:'分镜设计',      status:'mastered', desc:'将剧本转化为视觉语言，AI分镜提示词生成，镜头序列的叙事逻辑设计。',                                         tags:['分镜','视觉化','AI分镜','镜头序列'] },
    { id:'color',    cat:'film',    icon:'🌈', name:'色彩调色',      status:'learning', desc:'电影色彩学基础，调色盘设计，冷暖色对比，用色彩传达情绪与主题。',                                           tags:['色彩','调色','LUT','情绪色彩'] },
    { id:'sound',    cat:'film',    icon:'🔊', name:'声音设计',      status:'locked',   desc:'音效、配乐、音画关系，声音如何参与叙事，混音基础。',                                                        tags:['音效','配乐','混音','音画'] },
    { id:'film-lang',cat:'film',    icon:'🎭', name:'电影语言',      status:'mastered', desc:'电影理论基础，大导演风格研究（库布里克、芬奇、诺兰），通过经典作品提升审美。',                            tags:['电影理论','导演风格','视听语言','审美'] },
    { id:'copywrite',cat:'create',  icon:'✍️', name:'文案写作',     status:'mastered', desc:'标题公式、钩子设计、说服结构、爆款文案逻辑，平台调性适配。',                                                tags:['文案','标题','钩子','爆款'] },
    { id:'short-video',cat:'create',icon:'📲', name:'短视频创作',   status:'learning', desc:'竖屏叙事逻辑、黄金3秒、完播率优化，抖音/快手/Reels平台规则研究。',                                         tags:['短视频','竖屏','完播率','算法'] },
    { id:'short-drama',cat:'create',icon:'🎬', name:'出海短剧',     status:'mastered', desc:'欧美市场短剧题材研究（狼人/霸总/复仇），ReelShorts平台，出海短剧工业化生产流程。',                        tags:['短剧','ReelShorts','出海','欧美市场'] },
    { id:'world-build',cat:'create',icon:'🌍', name:'世界观构建',   status:'mastered', desc:'IP宇宙搭建、人物体系、历史背景、规则体系设计，为长线内容打基础。',                                         tags:['世界观','IP','人物体系','规则'] },
    { id:'persona',  cat:'create',  icon:'👤', name:'人设/角色设计', status:'mastered', desc:'爆款角色公式、人物对立关系、成长弧线，创作有辨识度的人设的方法论。',                                       tags:['人设','角色弧','人物关系','爆款'] },
    { id:'content-st',cat:'create', icon:'📊', name:'内容策略',     status:'learning', desc:'内容矩阵规划、选题方法论、平台算法理解，如何系统化生产爆款内容。',                                          tags:['内容矩阵','选题','算法','平台运营'] },
    { id:'marketing',cat:'business',icon:'📣', name:'数字营销',     status:'learning', desc:'SEO、SEM、社交媒体营销、KOL合作、私域运营，流量获取与转化漏斗。',                                          tags:['营销','SEO','私域','流量'] },
    { id:'product',  cat:'business',icon:'📦', name:'产品思维',     status:'learning', desc:'用户需求挖掘、MVP设计、产品迭代逻辑、PRD写作，从0到1构建产品。',                                            tags:['产品','MVP','用户研究','PRD'] },
    { id:'data-ana', cat:'business',icon:'📈', name:'数据分析',     status:'learning', desc:'业务数据指标体系、数据埋点、A/B测试、用增长驱动决策。',                                                      tags:['数据','指标','A/B测试','增长'] },
    { id:'overseas', cat:'business',icon:'🌐', name:'出海战略',     status:'mastered', desc:'欧美市场进入策略、本地化运营、跨境支付，短剧/工具出海的市场调研与落地。',                                   tags:['出海','本地化','欧美市场','跨境'] },
    { id:'ui-design',cat:'design',  icon:'🖥', name:'UI设计',       status:'learning', desc:'界面设计原则、组件系统、TDesign/MUI等设计系统的使用，游戏化UI设计。',                                       tags:['UI','设计系统','组件','Figma'] },
    { id:'visual-art',cat:'design', icon:'🖼', name:'视觉艺术',     status:'mastered', desc:'色彩构成、视觉层级、排版美学、图片美学鉴赏，系统提升视觉审美。',                                            tags:['美学','排版','色彩构成','视觉层级'] },
    { id:'motion',   cat:'design',  icon:'✨', name:'动效设计',     status:'locked',   desc:'过渡动画、微交互、Lottie动效，让界面有生命力的动效设计原则。',                                               tags:['动效','微交互','Lottie','过渡'] },
    { id:'branding', cat:'design',  icon:'💎', name:'品牌设计',     status:'learning', desc:'品牌视觉系统、Logo设计逻辑、风格指南，为内容IP建立一致的视觉形象。',                                        tags:['品牌','Logo','视觉系统','IP形象'] },
    { id:'system-think',cat:'thinking',icon:'🔄',name:'系统思维',  status:'mastered', desc:'把问题放在系统中理解，看关系与反馈，避免头痛医头，适用于复杂问题决策。',                                    tags:['系统论','反馈回路','全局观','复杂系统'] },
    { id:'mental',   cat:'thinking',icon:'🧩', name:'心理模型',    status:'learning', desc:'第一原理、逆向思维、奥卡姆剃刀等，查理·芒格的多元思维框架。',                                               tags:['第一原理','逆向思维','心理模型','决策'] },
    { id:'learning', cat:'thinking',icon:'📚', name:'学习方法论',  status:'mastered', desc:'费曼学习法、间隔重复、主动回忆，如何高效掌握新领域，建立知识体系。',                                        tags:['费曼','间隔重复','主动回忆','元学习'] },
    { id:'pkm',      cat:'thinking',icon:'🗂', name:'个人知识管理', status:'learning', desc:'Zettelkasten卡片盒笔记法、第二大脑、PARA系统，让知识可检索可生长。',                                       tags:['知识管理','Zettelkasten','PARA','第二大脑'] },
    { id:'creativity',cat:'thinking',icon:'💡',name:'创意思维',    status:'mastered', desc:'发散收敛思维、SCAMPER模型、随机刺激法，系统性地产生创意想法。',                                             tags:['创意','SCAMPER','发散思维','头脑风暴'] },
  ],
  links: [
    ['llm','ai-agent'],['llm','rag'],['llm','ai-coding'],['llm','multi-modal'],
    ['ai-agent','ai-coding'],['ai-agent','ai-workflow'],['ai-agent','rag'],
    ['ai-coding','nodejs'],['ai-coding','react'],['ai-coding','python'],
    ['ai-workflow','api'],
    ['ai-img','ai-video'],['ai-img','visual-art'],
    ['ai-video','storyboard'],['ai-video','short-drama'],['ai-video','short-video'],
    ['embodied','ai-agent'],['embodied','python'],
    ['fine-tune','llm'],['fine-tune','python'],
    ['js','react'],['js','nodejs'],['js','html-css'],
    ['react','ui-design'],['react','deploy'],
    ['nodejs','api'],['nodejs','deploy'],['nodejs','database'],
    ['python','database'],['python','data-ana'],
    ['git','deploy'],['api','miniapp'],
    ['script','storyboard'],['script','short-drama'],['script','persona'],['script','world-build'],
    ['storyboard','shot-comp'],['storyboard','ai-video'],
    ['film-lang','shot-comp'],['film-lang','color'],['film-lang','editing'],
    ['cinemato','shot-comp'],['cinemato','editing'],
    ['editing','short-video'],['editing','sound'],
    ['short-drama','overseas'],['short-drama','content-st'],
    ['copywrite','short-video'],['copywrite','content-st'],['copywrite','marketing'],
    ['world-build','persona'],['world-build','script'],
    ['persona','script'],['persona','short-drama'],
    ['content-st','marketing'],['content-st','data-ana'],
    ['overseas','marketing'],['overseas','product'],
    ['ui-design','visual-art'],['ui-design','motion'],
    ['branding','visual-art'],['branding','persona'],
    ['system-think','mental'],['system-think','learning'],
    ['mental','creativity'],['mental','product'],
    ['learning','pkm'],['learning','llm'],
    ['pkm','rag'],
    ['creativity','copywrite'],['creativity','world-build'],
  ],
  categories: {
    ai:       { name:'AI 技术',   color:'#00c8ff' },
    coding:   { name:'编程开发',  color:'#a855f7' },
    film:     { name:'影视编导',  color:'#f59e0b' },
    create:   { name:'内容创作',  color:'#ec4899' },
    business: { name:'商业运营',  color:'#22d3a0' },
    design:   { name:'视觉设计',  color:'#fb923c' },
    thinking: { name:'思维方法',  color:'#818cf8' },
  },
  title: '枕流 · 知识星图',
  subtitle: 'KNOWLEDGE CONSTELLATION',
};

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch(e) { console.error('读取数据失败:', e.message); }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 首次初始化
if (!fs.existsSync(DATA_FILE)) {
  writeData(DEFAULT_DATA);
  console.log('✅ 初始化数据文件:', DATA_FILE);
}

// ── 工具函数 ──────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch(e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
    res.end(content);
  } catch(e) {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// ── 路由处理 ──────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // 静态文件
  if (method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return serveFile(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html');
  }

  // ── API 路由 ──────────────────────────────────
  // GET /api/data — 获取全量数据
  if (method === 'GET' && pathname === '/api/data') {
    return json(res, readData());
  }

  // PUT /api/data — 全量保存（导入/导出用）
  if (method === 'PUT' && pathname === '/api/data') {
    const body = await parseBody(req);
    writeData(body);
    return json(res, { ok: true });
  }

  // GET /api/nodes — 获取所有节点
  if (method === 'GET' && pathname === '/api/nodes') {
    return json(res, readData().nodes);
  }

  // POST /api/nodes — 新增节点
  if (method === 'POST' && pathname === '/api/nodes') {
    const body = await parseBody(req);
    const data = readData();
    // 生成唯一ID
    if (!body.id) body.id = 'node_' + Date.now();
    // 检查重复
    if (data.nodes.find(n => n.id === body.id)) {
      return json(res, { ok: false, error: 'ID already exists' }, 400);
    }
    body.status = body.status || 'locked';
    body.tags = body.tags || [];
    data.nodes.push(body);
    writeData(data);
    return json(res, { ok: true, node: body });
  }

  // PUT /api/nodes/:id — 更新节点
  const nodeEditMatch = pathname.match(/^\/api\/nodes\/(.+)$/);
  if (method === 'PUT' && nodeEditMatch) {
    const id = decodeURIComponent(nodeEditMatch[1]);
    const body = await parseBody(req);
    const data = readData();
    const idx = data.nodes.findIndex(n => n.id === id);
    if (idx === -1) return json(res, { ok: false, error: 'Node not found' }, 404);
    data.nodes[idx] = { ...data.nodes[idx], ...body, id };
    writeData(data);
    return json(res, { ok: true, node: data.nodes[idx] });
  }

  // DELETE /api/nodes/:id — 删除节点
  if (method === 'DELETE' && nodeEditMatch) {
    const id = decodeURIComponent(nodeEditMatch[1]);
    const data = readData();
    const before = data.nodes.length;
    data.nodes = data.nodes.filter(n => n.id !== id);
    // 同时删除相关连线
    data.links = data.links.filter(([a, b]) => a !== id && b !== id);
    if (data.nodes.length === before) return json(res, { ok: false, error: 'Node not found' }, 404);
    writeData(data);
    return json(res, { ok: true });
  }

  // GET /api/links — 获取所有连线
  if (method === 'GET' && pathname === '/api/links') {
    return json(res, readData().links);
  }

  // POST /api/links — 新增连线
  if (method === 'POST' && pathname === '/api/links') {
    const body = await parseBody(req);
    const { from, to } = body;
    if (!from || !to) return json(res, { ok: false, error: 'Missing from/to' }, 400);
    const data = readData();
    // 检查重复
    const exists = data.links.find(([a, b]) => (a === from && b === to) || (a === to && b === from));
    if (exists) return json(res, { ok: false, error: 'Link already exists' }, 400);
    data.links.push([from, to]);
    writeData(data);
    return json(res, { ok: true });
  }

  // DELETE /api/links — 删除连线
  if (method === 'DELETE' && pathname === '/api/links') {
    const body = await parseBody(req);
    const { from, to } = body;
    const data = readData();
    data.links = data.links.filter(([a, b]) => !((a === from && b === to) || (a === to && b === from)));
    writeData(data);
    return json(res, { ok: true });
  }

  // GET /api/categories — 获取分类
  if (method === 'GET' && pathname === '/api/categories') {
    return json(res, readData().categories);
  }

  // POST /api/categories — 新增分类
  if (method === 'POST' && pathname === '/api/categories') {
    const body = await parseBody(req);
    const { id, name, color } = body;
    if (!id || !name || !color) return json(res, { ok: false, error: 'Missing fields' }, 400);
    const data = readData();
    data.categories[id] = { name, color };
    writeData(data);
    return json(res, { ok: true });
  }

  // DELETE /api/categories/:id — 删除分类
  const catMatch = pathname.match(/^\/api\/categories\/(.+)$/);
  if (method === 'DELETE' && catMatch) {
    const id = decodeURIComponent(catMatch[1]);
    const data = readData();
    delete data.categories[id];
    writeData(data);
    return json(res, { ok: true });
  }

  // PUT /api/settings — 更新站点设置（标题等）
  if (method === 'PUT' && pathname === '/api/settings') {
    const body = await parseBody(req);
    const data = readData();
    if (body.title !== undefined) data.title = body.title;
    if (body.subtitle !== undefined) data.subtitle = body.subtitle;
    writeData(data);
    return json(res, { ok: true });
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n🌌 知识星图服务已启动`);
  console.log(`   本地访问: http://localhost:${PORT}`);
  console.log(`   数据文件: ${DATA_FILE}`);
  console.log(`   按 Ctrl+C 停止\n`);
});
