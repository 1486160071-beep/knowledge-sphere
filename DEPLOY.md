# 知识星图 · 公网部署指南

## 项目结构

```
knowledge-sphere/
├── index.html     # 前端（自动从 /api 加载数据）
├── server.js      # 后端服务（Node.js 原生 http 模块）
├── data.json      # 数据文件（自动生成，包含所有节点/连线/分类）
└── DEPLOY.md      # 本文件
```

---

## 方案一：Railway（推荐，免费，5分钟完成）

1. 注册 https://railway.app（GitHub 登录）
2. New Project → Deploy from GitHub Repo
3. 上传本目录到一个 GitHub 仓库
4. Railway 自动检测 Node.js，设置启动命令：`node server.js`
5. 在 Settings → Networking 里点击 **Generate Domain**
6. 访问分配的域名即可 🎉

> ⚠️ Railway 免费版有休眠机制，生产使用建议付费。

---

## 方案二：腾讯云轻量服务器（¥24/月起，稳定）

```bash
# 1. 购买轻量服务器（Ubuntu 22.04），在控制台开放 7788 端口

# 2. SSH 连接后安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 上传项目文件（本机执行）
scp -r /Users/mac/WorkBuddy/Claw/knowledge-sphere/ root@你的IP:/var/www/

# 4. 服务器上安装 PM2（进程守护）
npm install -g pm2

# 5. 启动服务
cd /var/www/knowledge-sphere
pm2 start server.js --name knowledge-sphere

# 6. 开机自启
pm2 startup && pm2 save

# 7. 配置 Nginx 反向代理（可选，支持 HTTPS）
# /etc/nginx/sites-available/knowledge-sphere
server {
    listen 80;
    server_name 你的域名.com;
    location / {
        proxy_pass http://localhost:7788;
        proxy_set_header Host $host;
    }
}
```

---

## 方案三：Render（免费，比 Railway 更稳定）

1. 注册 https://render.com
2. New → Web Service → Connect GitHub Repo
3. Build Command: `echo done`
4. Start Command: `node server.js`
5. 自动分配 HTTPS 域名

---

## 方案四：Vercel + Cloudflare R2（Serverless，免费）

> 适合无服务器部署，但需要改造成 Serverless 函数。不推荐新手。

---

## 数据持久化说明

- 本地运行：数据存储在 `data.json`，重启不丢失
- Railway/Render：容器重启会丢失 data.json，建议：
  1. 使用 **Railway Volume** 挂载持久化存储
  2. 或改用数据库（推荐 **Supabase** 免费 PostgreSQL）

### 接入 Supabase（可选升级）

1. 注册 https://supabase.com，创建项目
2. 在 Table Editor 创建 `knowledge_data` 表（id, json_data, updated_at）
3. 修改 server.js 的 `readData/writeData` 函数改用 Supabase REST API
4. 数据永久免费存储，支持多人协作

---

## 快速本地启动

```bash
cd knowledge-sphere
node server.js
# 打开 http://localhost:7788
```

## API 接口文档

| 方法   | 路径               | 说明             |
|--------|-------------------|------------------|
| GET    | /api/data         | 获取全量数据      |
| PUT    | /api/data         | 全量导入数据      |
| GET    | /api/nodes        | 获取所有节点      |
| POST   | /api/nodes        | 新增节点          |
| PUT    | /api/nodes/:id    | 更新节点          |
| DELETE | /api/nodes/:id    | 删除节点          |
| GET    | /api/links        | 获取所有连线      |
| POST   | /api/links        | 新增连线          |
| DELETE | /api/links        | 删除连线          |
| GET    | /api/categories   | 获取分类列表      |
| POST   | /api/categories   | 新增分类          |
| PUT    | /api/settings     | 更新站点标题      |
