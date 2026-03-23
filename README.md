<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="PortMan">
</p>

<h1 align="center">PortMan</h1>

<p align="center">
  A lightweight desktop app to view and manage listening ports.
  <br />
  <a href="./README.zh-CN.md">中文文档</a>
</p>

<!-- screenshot -->

## Features

- **Port Overview** — See all listening ports, protocols, addresses, and PIDs at a glance
- **Process Info** — Shows process name and full command for each port
- **One-Click Kill** — Terminate processes occupying ports with a confirmation dialog
- **Search & Filter** — Quickly find ports by number, process name, or PID
- **Cross-Platform** — macOS (lsof), Windows (netstat), Linux (lsof)
- **System Theme** — Follows system dark/light mode
- **i18n** — English and Chinese, auto-detected from OS locale
- **Lightweight** — Built with Tauri, ~5MB install size

## Install

Download from [GitHub Releases](https://github.com/qiuxchao/portman/releases):

- **macOS**: `.dmg` (Apple Silicon & Intel)
- **Windows**: `.msi` / `.nsis`
- **Linux**: `.deb` / `.AppImage`

### macOS: "App is damaged" fix

```bash
xattr -cr /Applications/portman.app
```

## Tech Stack

Tauri 2 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Rust · sysinfo

## Build from Source

Prerequisites: [Rust](https://rustup.rs/), [Node.js 22+](https://nodejs.org/), [Bun](https://bun.sh/)

```bash
git clone https://github.com/qiuxchao/portman.git
cd portman
bun install
bun run tauri dev
```

## License

[MIT](./LICENSE)
