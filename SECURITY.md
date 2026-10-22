# Security Policy

## 报告安全问题

请不要在公开 Issue 中粘贴密钥、AppSecret、真实 AppID、访问令牌或可利用细节。

优先使用 GitHub 仓库的“Security”页面：

1. 打开仓库的 **Security** 标签。
2. 选择 **Report a vulnerability**。
3. 描述影响、复现方式和建议修复方案。

如果仓库尚未开启 Private vulnerability reporting，请先用普通 Issue 联系维护者，只说明“需要私下报告安全问题”，不要公开敏感内容。

## 仓库约定

- `project.private.config.json`、`.env` 和本地配置不进入 Git。
- 公开示例使用 `touristappid`，不使用真实 AppID。
- 发布前检查提交历史和 Changes，确认没有密钥或个人邮箱。
