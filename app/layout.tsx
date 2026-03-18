import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Claude Code 功能中心',
  description: '可视化展示已安装的技能和插件，提供新手引导和使用推荐',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
