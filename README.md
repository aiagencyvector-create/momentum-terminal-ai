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

## Gerar instalador Windows (M6)

O electron-builder usa um cache (`winCodeSign`) que contém symlinks para macOS dentro do archive. Windows não permite criar symlinks sem privilégio — você precisa **habilitar Developer Mode** (uma vez só, sem precisar de admin):

1. Abra `ms-settings:developers` (Windows + R, cola e Enter)
2. Liga **Developer Mode**
3. Fecha tudo, abre PowerShell de novo
4. Roda:

```powershell
cd C:\dev\momentum-terminal-ai
pnpm package:win
```

Sai um instalador NSIS em `release\0.0.1\Momentum Terminal AI-0.0.1-x64-setup.exe`. Você dá dois cliques, ele instala em `Program Files`, cria atalho no Iniciar e na Área de Trabalho.

Para um build sem instalador (só a pasta unpacked com o `.exe` dentro), use `pnpm package:dir` — sai em `release\0.0.1\win-unpacked\`.

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
