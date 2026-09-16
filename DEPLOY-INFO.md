# iori-nav 部署信息（本机备忘，勿提交）

- 线上地址: **https://io.shzt.de**（自定义域名，已绑 Cloudflare）
- pages.dev 备用: https://iori-nav-app.pages.dev
- Cloudflare 账号: ztphoenix@hotmail.com (fb7361c6f851ddad05e05324bedb3a45)
- GitHub Fork: https://github.com/DeterminantMatrix/iori-nav (upstream: jy02739244/iori-nav)
- 本地目录: D:\WPS SyncDisk\2.Tool\1.VibeCoding\iori-nav
- 当前分支: master（已合入 mmw-black 主题：MMW 双模式 UI + 吸底栏布局：分组行/搜索框常驻底部，分组横向滚动居中）

## 资源
- D1 数据库 `book`: 3a13e22d-abbc-4625-b6c1-d30210aa5be1
- KV 命名空间 `NAV_AUTH`: bdfe8c963e7240eca89702e0f7b21ff3
- Pages 项目: iori-nav-app（生产分支 master）
- 自定义域名: io.shzt.de（CNAME → iori-nav-app.pages.dev，区域 shzt.de id: 024a87cf3af177105a3811ddcec1a4e8）

## 管理员
- 用户名: admin
- 密码: a4bfdef5a298c22d0a243d40

## 自动更新（已配置）
- fork 上有 GitHub Actions 工作流 `.github/workflows/sync-and-deploy.yml`，每 6 小时自动合并上游 → 自动部署到 iori-nav-app
- 仓库 Secrets：CLOUDFLARE_ACCOUNT_ID、CLOUDFLARE_API_TOKEN（Pages:Edit）
- fork master = 上游 + 本地提交（工作流、mmw 主题、wrangler.toml[project name=iori-nav-app]）
- 注意：GitHub 会停掉 60 天无活动的定时工作流

## 主题相关（mmw-black 分支已合入 master）
- public/css/mmw-black.css：MMW 双模式主题（暗=暖黑#15130f / 亮=暖沙金#d4c096），随右上角主题开关切换
- public/css/mm-noise.png + .fx-grain：噪点质感层（暗 screen / 亮 multiply）
- public/js/home-quick-strip.js：快捷栏（固定2+最近3，本机 localStorage 记录点击）
- 布局：快捷栏置顶 → 搜索框居中（引擎行在下）→ 书签卡片 → 分组行+搜索框吸底（类 App）
- 页脚已按需求移除；统计标题已隐藏（.home-stats-row display:none）

## 手动更新站点步骤
```
cd "D:\WPS SyncDisk\2.Tool\1.VibeCoding\iori-nav"
git pull upstream master   # 有冲突时优先保留本地主题相关改动
npx wrangler pages deploy
```

## 改密码步骤（KV 与 wrangler API 视角隔离，需运行时侧写入）
临时新建 functions/api/seed.js 写入 admin_username/admin_password → `npx wrangler pages deploy` → 访问一次该端点 → 删除文件再部署。

## 已知怪象
Cloudflare Pages 运行时绑定的 KV 与 API/dashboard 看到的 KV 数据面相互隔离（D1 正常互通）。
管理员凭证采用"部署时由运行时侧写入"方式；改密码需重走该流程。
改动首页布局/样式后需清 KV 首页缓存（后台「刷新缓存」按钮，或临时 clear-cache 端点）。

## 预览子项目（可选保留）
- iori-nav-dark.pages.dev（Pages 项目 iori-nav-dark，分支 mmw-black 旧版本）：主题预览用，可删
