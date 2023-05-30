import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { globSync } from 'glob'
import path from 'path'

const wpPath = 'docs/wp/**/*.md'
const mdList = globSync(wpPath, { ignore: 'node_modules/**' }).map(p=>{
  return p.split(path.sep).join('/').replace(/^docs(.+)/, '$1')
})
console.log(wpPath, mdList)
// <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9615232600361986" crossorigin="anonymous"></script>
export default defineUserConfig({
  lang: 'zh-CN',
  title: '开发笔记',
  description: 'Just playing around',
  base: '/',
  head: [['script', { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9615232600361986', async:true, crossorigin: 'anonymous' }]],
  theme: defaultTheme({
    navbar: [{
      text: 'suboy',
      link: 'https://www.suboy.cn'
    }],
    sidebar: [{
      text: '前言',
      link: '/'
    },
    ...mdList
    ]
  }),
  plugins: [
    googleAnalyticsPlugin({
      id: 'G-1PPH0NSYVE'
    }),
    registerComponentsPlugin({
      components: {
        adSense: path.resolve(__dirname, './components/adSense.vue')
      }
    })
  ]
})
