# iori-nav 部署信息（本机备忘，勿提交）

- 线上地址: https://iori-nav-app.pages.dev
- Cloudflare 账号: ztphoenix@hotmail.com (fb7361c6f851ddad05e05324bedb3a45)
- GitHub Fork: https://github.com/DeterminantMatrix/iori-nav (upstream: jy02739244/iori-nav)
- 本地目录: D:\WPS SyncDisk\2.Tool\1.VibeCoding\iori-nav

## 资源
- D1 数据库 `book`: 3a13e22d-abbc-4625-b6c1-d30210aa5be1
- KV 命名空间 `NAV_AUTH`: bdfe8c963e7240eca89702e0f7b21ff3
- Pages 项目: iori-nav-app（生产分支 master）

## 管理员
- 用户名: admin
- 密码: a4bfdef5a298c22d0a243d40

## 自动更新（已配置）
- fork 上有 GitHub Actions 工作流 `.github/workflows/sync-and-deploy.yml`，每 6 小时自动合并上游 → 自动部署
- 需要仓库 Secrets：CLOUDFLARE_ACCOUNT_ID（已设）、CLOUDFLARE_API_TOKEN（已设，Pages:Edit，2026-09-14 部署验证通过）
- fork master = 上游 + 2 个本地提交（工作流文件 + wrangler.toml，均无敏感信息）
- 注意：GitHub 会停掉 60 天无活动的定时工作流，长时间没动静就去 Actions 页面看一眼

## 手动更新站点步骤
```
cd "D:\WPS SyncDisk\2.Tool\1.VibeCoding\iori-nav"
git pull upstream master
npx wrangler pages deploy
```

## 改密码步骤（KV 与 wrangler API 视角隔离，需运行时侧写入）
临时新建 functions/api/seed.js 写入 admin_username/admin_password → `npx wrangler pages deploy` → 访问一次该端点 → 删除文件再部署。

## 已知怪象
Cloudflare Pages 运行时绑定的 KV 与 API/dashboard 看到的 KV 数据面相互隔离（D1 正常互通）。
因此管理员凭证采用"部署时由运行时侧写入"的方式；会话/缓存只存在于运行时侧 KV，不影响功能。

## 可选待办
- 绑定自定义域名（需要用户提供域名并把域名接入 Cloudflare）
- 开启 Turnstile 人机验证（wrangler.toml 中 TURNSTILE_SITE_KEY / SECRET_KEY）
- 站点名称/描述/页脚可在后台设置中修改
