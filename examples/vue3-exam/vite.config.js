import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// Custom plugin: copy ffmpeg-core files and add hash during build
function copyFFmpegCorePlugin() {
  let config
  const virtualModuleId = 'virtual:ffmpeg-config'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  let hashedFileNames = {}

  return {
    name: 'copy-ffmpeg-core',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // In dev mode, return the node_modules path
        // In build mode, return the hashed path after build
        if (config.command === 'serve') {
          return `export default {
            coreURL: '/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js',
            wasmURL: '/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm'
          }`
        } else {
          // During the build process, we need to calculate the hash first
          const sourceDir = path.resolve('node_modules/@ffmpeg/core/dist/esm')
          const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm']
          const fileMap = {}
          
          files.forEach(fileName => {
            const sourcePath = path.join(sourceDir, fileName)
            if (fs.existsSync(sourcePath)) {
              const content = fs.readFileSync(sourcePath)
              const hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
              const baseName = path.basename(fileName, path.extname(fileName))
              const ext = path.extname(fileName)
              fileMap[fileName] = `${baseName}.${hash}${ext}`
            }
          })
          
          hashedFileNames = fileMap
          
          return `export default {
            coreURL: '/static/${fileMap['ffmpeg-core.js'] || 'ffmpeg-core.js'}',
            wasmURL: '/static/${fileMap['ffmpeg-core.wasm'] || 'ffmpeg-core.wasm'}'
          }`
        }
      }
    },
    
    closeBundle() {
      if (config.command !== 'build') return
      
      const sourceDir = path.resolve('node_modules/@ffmpeg/core/dist/esm')
      const targetDir = path.resolve('dist/static')
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      
      // copy files
      Object.entries(hashedFileNames).forEach(([originalName, hashedName]) => {
        const sourcePath = path.join(sourceDir, originalName)
        const targetPath = path.join(targetDir, hashedName)
        
        if (fs.existsSync(sourcePath)) {
          const content = fs.readFileSync(sourcePath)
          fs.writeFileSync(targetPath, content)
          console.log(`✓ Copied ${originalName} → ${hashedName}`)
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    copyFFmpegCorePlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  optimizeDeps: {
    exclude: [
      ...(process.env.NODE_ENV === 'development' ? [
        '@ffmpeg/ffmpeg',
      ] : [])
    ],
  },
  build: {
    assetsDir: 'static',
  },
  server: {
    port: 3000,
  },
})
