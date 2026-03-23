<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="PortMan">
</p>

<h1 align="center">PortMan</h1>

<p align="center">
  轻量级端口管理桌面工具
  <br />
  <a href="./README.md">English</a>
</p>

<!-- screenshot -->

## 功能

- **端口概览** — 一目了然查看所有监听端口、协议、地址和 PID
- **进程信息** — 显示每个端口对应的进程名和完整命令
- **一键终止** — 带确认弹窗终止占用端口的进程
- **搜索过滤** — 按端口号、进程名、PID 快速查找
- **跨平台** — macOS (lsof)、Windows (netstat)、Linux (lsof)
- **跟随系统主题** — 自动适配深色/浅色模式
- **多语言** — 中英双语，自动检测系统语言
- **极致轻量** — 基于 Tauri，安装包仅 ~5MB

## 安装

从 [GitHub Releases](https://github.com/qiuxchao/portman/releases) 下载对应平台安装包：

- **macOS**：`.dmg`（支持 Apple Silicon 和 Intel）
- **Windows**：`.msi` / `.nsis`
- **Linux**：`.deb` / `.AppImage`

### macOS："应用已损坏"解决方法

```bash
xattr -cr /Applications/portman.app
```

## 技术栈

Tauri 2 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Rust · sysinfo

## 从源码构建

前置条件：[Rust](https://rustup.rs/)、[Node.js 22+](https://nodejs.org/)、[Bun](https://bun.sh/)

```bash
git clone https://github.com/qiuxchao/portman.git
cd portman
bun install
bun run tauri dev
```

## 许可证

[MIT](./LICENSE)
