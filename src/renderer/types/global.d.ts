export {}

declare global {
  interface Window {
    dzz: {
      platform: string
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
      }
      dialog: {
        selectDirectory: () => Promise<string | null>
      }
      pty: {
        create: (options: { cwd?: string }) => Promise<string>
        write: (id: string, data: string) => Promise<void>
        resize: (id: string, cols: number, rows: number) => Promise<void>
        destroy: (id: string) => Promise<void>
        exists: (id: string) => Promise<boolean>
        onData: (id: string, callback: (data: string) => void) => () => void
        onExit: (id: string, callback: (exitCode: number) => void) => () => void
        getCwd: () => Promise<string>
      }
      store: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<void>
      }
    }
  }
}
