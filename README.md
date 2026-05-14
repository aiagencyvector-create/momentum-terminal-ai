# Momentum Terminal AI

App desktop Electron que unifica terminal, editor (Monaco), agentes de IA (Claude Code / Codex), Live Preview, Debug Center, Test Lab, Main Brain (graph via Supabase + pgvector) e Project Studio (system design canvas).

> Status: **M0 — Bootstrap.** Janela inicial com shell de navegação entre as 5 áreas. Funcionalidades reais nas fases M1+ conforme `~/.claude/plans/preciso-criar-um-plano-cosmic-brook.md`.

## Stack

- Electron 33 + electron-vite + electron-builder
- React 18 + TypeScript estrito + Tailwind
- Monaco · xterm.js · node-pty · React Flow · Zustand
- Supabase (Postgres + pgvector + Auth + Realtime) — fase M3

## Pré-requisitos

- Node 22+ e pnpm 11+ (`npm i -g pnpm`)
- Para a fase **M1** (terminal real com `node-pty`): instalar **Visual Studio Build Tools** com workload "Desktop development with C++" **ou** trocar para `@homebridge/node-pty-prebuilt-multiarch` (binários prebuilt). No M0 a dependência ainda não é necessária.

## Scripts

```powershell
pnpm install        # instala deps (postinstall faz rebuild nativo)
pnpm dev            # roda em modo desenvolvimento
pnpm typecheck      # valida tipos main+preload e renderer
pnpm build          # build de produção
pnpm package:win    # gera instalador NSIS x64 em release/
```

## Estrutura

```
src/
├── main/        Main process: lifecycle, IPC, PTYs, FS watchers, Supabase server-side
├── preload/     Bridge tipada exposta como window.api (sandbox + contextIsolation)
└── renderer/    UI React (workspaces, brain, studio, debug, testlab)
```

## Segurança

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`
- CSP estrito no `index.html`
- `webviewTag: true` apenas para Live Preview (URLs locais e configuradas pelo usuário)
- Toda comunicação Node ↔ Renderer passa por `ipcMain.handle` + `contextBridge.exposeInMainWorld`
