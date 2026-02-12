# AI 德扑 - 手动完成步骤

由于网络限制，以下步骤需要手动完成。

---

## 1. 推送代码到 GitHub

代码已提交到本地 Git 仓库，需要手动推送：

```bash
cd e:\Software\ai-poker
git push -u origin main
```

如果提示身份验证，使用 GitHub CLI：
```bash
gh auth login
git push -u origin main
```

**目标仓库**: https://github.com/drinkingmorewater/ai-poker

---

## 2. 部署到 Vercel

### 步骤：

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New Project"**
3. 选择 **"Import Git Repository"**
4. 找到并导入 `drinkingmorewater/ai-poker`
5. 在 **Environment Variables** 中添加：

| 变量名 | 值 |
|--------|-----|
| `SECONDME_CLIENT_ID` | `81fcbfc8-8204-482f-a075-729f71fbf6db` |
| `SECONDME_CLIENT_SECRET` | `7ae1cd9eb200494b42b4e0e886d9e03f654c7b4d337fca3b907857e730a3f059` |
| `SECONDME_REDIRECT_URI` | `https://你的项目名.vercel.app/api/auth/callback` |
| `SECONDME_API_BASE_URL` | `https://app.mindos.com/gate/lab` |
| `SECONDME_OAUTH_URL` | `https://go.second.me/oauth/` |
| `DATABASE_URL` | `file:./dev.db` |
| `NEXTAUTH_SECRET` | `ai-poker-production-secret-change-me` |

6. 点击 **Deploy**
7. 部署完成后，更新 `SECONDME_REDIRECT_URI` 为实际域名

### 注意事项：
- Vercel 免费版对 Serverless Functions 有 10 秒超时限制
- SQLite 在 Vercel 上是只读的，生产环境建议使用 Vercel Postgres 或 PlanetScale

---

## 3. 录制演示视频

### 推荐内容（1-2分钟）：

1. **首页展示** (10秒)
   - 展示 AI 德扑首页界面
   - 显示功能入口

2. **创建游戏** (20秒)
   - 点击"创建新游戏"
   - 设置游戏名称、筹码、盲注
   - 添加/选择 AI 玩家
   - 点击创建

3. **观看 AI 对战** (40秒)
   - 展示实时牌桌界面
   - 观看 AI 自动下注、跟注、加注、弃牌
   - 展示公共牌发放过程

4. **游戏控制** (20秒)
   - 演示暂停/继续功能
   - 演示速度调节 (0.5x → 5x)
   - 展示行动日志和筹码排名

### 录屏工具：
- **Windows**: Win+G 游戏栏，或 OBS Studio
- **在线工具**: Loom, ScreenPal
- **上传平台**: B站, YouTube

---

## 4. Hackathon 提交信息

### 已准备好的内容：

**项目名称**: AI 德扑

**项目简介**: 让AI智能体自主博弈的德州扑克竞技场，展现纯策略与运气的巅峰对决。

**赛道**: 赛道二：AI 游戏过大年

**Client ID**: 81fcbfc8-8204-482f-a075-729f71fbf6db

**封面图**: `e:\Software\ai-poker\public\cover.png`

**技术栈**: Next.js, TypeScript, TailwindCSS, Prisma, SQLite, SSE, SecondMe API

**标签**: AI游戏, 德州扑克, SecondMe, 智能体, 实时对战

### 项目详情 (Markdown):

```markdown
# AI 德扑 - AI 智能体德州扑克竞技平台

## 项目亮点

- **纯 AI 对战**：多个 AI 智能体自主进行德州扑克博弈，无需人类干预
- **SecondMe 集成**：支持使用你的 AI 分身参与对局，展现个性化策略
- **实时观战**：通过 SSE 实时推送游戏状态，观看 AI 之间的策略博弈
- **完整游戏引擎**：支持所有德州扑克规则，包括边池计算、牌型评估、摊牌比较

## 核心功能

1. **创建游戏**：自定义玩家数量(2-9人)、初始筹码、盲注设置
2. **AI 策略**：
   - 随机策略 Agent：基于概率的基础决策
   - SecondMe AI 分身：通过 Act API 获取智能决策
3. **实时控制**：暂停/继续、速度调节(0.5x~5x)、终止游戏
4. **数据统计**：各策略胜率、盈亏分析、历史回放

## 技术实现

- **前端**：Next.js 16 + TypeScript + TailwindCSS
- **后端**：Next.js API Routes + Prisma ORM
- **数据库**：SQLite
- **实时通信**：Server-Sent Events (SSE)
- **AI 集成**：SecondMe OAuth2 + Act API
```

---

## 待填写链接

完成上述步骤后填写：

- **GitHub 链接**: https://github.com/drinkingmorewater/ai-poker
- **作品链接**: https://ai-poker-xxx.vercel.app (部署后获取)
- **视频链接**: (录制上传后获取)
