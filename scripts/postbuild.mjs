/* eslint-disable */
import rss from './rss.mjs'
import path from 'path'
import fs from 'fs/promises'

async function postbuild() {
  await rss()
}

// Add this function to process new markdown files
async function processNewMarkdownFiles() {
  const blogDir = path.join(process.cwd(), 'data/blog')
  const files = await fs.readdir(blogDir)
  const basePath = process.env.BASE_PATH || ''
  
  for (const file of files) {
    if (file.endsWith('.md') && !file.endsWith('.mdx')) {
      const mdPath = path.join(blogDir, file)
      const mdxPath = mdPath.replace('.md', '.mdx')
      
      // Read the markdown content
      let content = await fs.readFile(mdPath, 'utf-8')
      
      // Replace image paths - match both with and without ./ prefix
      content = content.replace(
        /!\[(.*?)\]\((\.\/)?attachments\/(.*?)\)/g,
        `![$1]${basePath}/static/attachments/$3)`
      )
      
      // Add frontmatter if it doesn't exist
      const processedContent = content.startsWith('---') 
        ? content 
        : `---
title: ${file.replace('.md', '')}
date: ${new Date().toISOString()}
tags: []
draft: false
---

${content}`
      
      // Write as MDX
      await fs.writeFile(mdxPath, processedContent)
      
      // Remove original MD file
      await fs.unlink(mdPath)
    }
  }
}

postbuild()
await processNewMarkdownFiles()
