import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('dzz', {
  platform: process.platform,

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },

  dialog: {
    selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory')
  },

  pty: {
    create: (options: { cwd?: string }) => ipcRenderer.invoke('pty:create', options),
    write: (id: string, data: string) => ipcRenderer.invoke('pty:write', id, data),
    resize: (id: string, cols: number, rows: number) => ipcRenderer.invoke('pty:resize', id, cols, rows),
    destroy: (id: string) => ipcRenderer.invoke('pty:destroy', id),
    exists: (id: string) => ipcRenderer.invoke('pty:exists', id),
    onData: (id: string, callback: (data: string) => void) => {
      const channel = `pty:data:${id}`
      const listener = (_event: unknown, data: string) => callback(data)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    },
    onExit: (id: string, callback: (exitCode: number) => void) => {
      const channel = `pty:exit:${id}`
      const listener = (_event: unknown, exitCode: number) => callback(exitCode)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    },
    getCwd: (id: string) => ipcRenderer.invoke('pty:cwd', id)
  },

  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value)
  },

  update: {
    check: () => ipcRenderer.send('update:check'),
    download: () => ipcRenderer.send('update:download'),
    install: () => ipcRenderer.send('update:install'),
    onAvailable: (callback: (version: string) => void) => {
      const listener = (_event: unknown, version: string) => callback(version)
      ipcRenderer.on('update:available', listener)
      return () => ipcRenderer.removeListener('update:available', listener)
    },
    onNotAvailable: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('update:not-available', listener)
      return () => ipcRenderer.removeListener('update:not-available', listener)
    },
    onProgress: (callback: (percent: number) => void) => {
      const listener = (_event: unknown, percent: number) => callback(percent)
      ipcRenderer.on('update:progress', listener)
      return () => ipcRenderer.removeListener('update:progress', listener)
    },
    onDownloaded: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('update:downloaded', listener)
      return () => ipcRenderer.removeListener('update:downloaded', listener)
    }
  }
})
