import { useEffect, useRef } from 'react';
import { Terminal as Xterm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

type Props = {
  ptyId: string;
  cwd?: string;
  onTitleChange?: (title: string) => void;
};

export function Terminal({ ptyId }: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const term = new Xterm({
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.2,
      theme: {
        background: '#0b0d12',
        foreground: '#e6e8ee',
        cursor: '#7c5cff',
        black: '#0b0d12',
        red: '#ff6b81',
        green: '#a3e635',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e6e8ee',
        brightBlack: '#5b6478',
        brightRed: '#ff8a9a',
        brightGreen: '#bef264',
        brightYellow: '#fcd34d',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#ffffff',
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.open(el);
    fit.fit();

    const offData = window.api.terminal.onData(({ id, data }) => {
      if (id === ptyId) term.write(data);
    });

    const onUserInput = term.onData((data) => {
      void window.api.terminal.write(ptyId, data);
    });

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
        void window.api.terminal.resize(ptyId, term.cols, term.rows);
      } catch {
        // ignore
      }
    });
    ro.observe(el);

    // initial size sync
    queueMicrotask(() => {
      try {
        fit.fit();
        void window.api.terminal.resize(ptyId, term.cols, term.rows);
      } catch {
        // ignore
      }
    });

    return () => {
      ro.disconnect();
      onUserInput.dispose();
      offData();
      term.dispose();
    };
  }, [ptyId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
