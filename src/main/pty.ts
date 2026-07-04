import { ipcMain, BrowserWindow } from 'electron'
import * as pty from '@lydell/node-pty'
import { IPty } from '@lydell/node-pty'

const sessions = new Map<string, IPty>()
let nextId = 1

export function registerPtyHandlers() {
  ipcMain.handle('pty:create', (_event, options: { cwd?: string }) => {
    const id = `term-${nextId++}`
    const shell = 'powershell.exe'
    const shellArgs = ['-NoProfile', '-NoLogo', '-NoExit', '-Command', "function prompt {'❯ '}"]

    const term = pty.spawn(shell, shellArgs, {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: options.cwd || process.env.USERPROFILE || undefined,
      env: { ...process.env } as { [key: string]: string }
    })

    term.onData((data) => {
      const win = BrowserWindow.getAllWindows()[0]
      if (win && !win.isDestroyed()) {
        win.webContents.send(`pty:data:${id}`, data)
      }
    })

    term.onExit(({ exitCode }) => {
      const win = BrowserWindow.getAllWindows()[0]
      if (win && !win.isDestroyed()) {
        win.webContents.send(`pty:exit:${id}`, exitCode)
      }
      sessions.delete(id)
    })

    sessions.set(id, term)
    return id
  })

  ipcMain.handle('pty:write', (_event, id: string, data: string) => {
    const term = sessions.get(id)
    if (term) {
      term.write(data)
    }
  })

  ipcMain.handle('pty:resize', (_event, id: string, cols: number, rows: number) => {
    const term = sessions.get(id)
    if (term && cols > 0 && rows > 0) {
      term.resize(cols, rows)
    }
  })

  ipcMain.handle('pty:destroy', (_event, id: string) => {
    const term = sessions.get(id)
    if (term) {
      term.kill()
      sessions.delete(id)
    }
  })

  ipcMain.handle('pty:exists', (_event, id: string) => {
    return sessions.has(id)
  })

  ipcMain.handle('pty:cwd', () => {
    return process.env.USERPROFILE || 'C:\\'
  })
}
