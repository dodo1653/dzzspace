module.exports = {
  packagerConfig: {
    asar: true,
    name: 'dzzspace',
    executableName: 'dzzspace',
    appBundleId: 'com.dzzspace.app',
    win32metadata: {
      ProductName: 'dzzspace',
      CompanyName: 'dzzspace'
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'dzzspace',
        setupExe: 'dzzspace-Setup.exe',
        noMsi: true
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    }
  ]
}
