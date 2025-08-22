import fs from 'fs'
import path from 'path'

const _fs = fs.promises

let handler = async (m, { text, usedPrefix, command, __dirname }) => {
  try {
    if (!text) {
      throw `
✳️ Usage: ${usedPrefix + command} <name file> <new code>

📌 Example:
        ${usedPrefix}paste main.js
        // New code content here...
      `.trim()
    }

    // Split and sanitize input
    const args = text.trim().split('\n')
    const filename = args[0]?.trim()
    const newCode = args.slice(1).join('\n').trim()

    // Validate input
    if (!filename || !newCode) {
      throw 'Please provide both a file name and new code content.'
    }

    if (filename.includes('..') || filename.startsWith('/')) {
      throw 'Invalid file name. Avoid using ".." or absolute paths.'
    }

    const pathFile = path.join(__dirname, filename)

    // Write the file
    if (!fs.existsSync(pathFile)) {
      await m.reply(`⚠️ The file *${filename}* does not exist. It will be created.`)
    }

    await _fs.writeFile(pathFile, newCode, 'utf8')
    await m.reply(`✅ The file *${filename}* has been updated successfully.`)
  } catch (err) {
    console.error(err)
    await m.reply(`❎ Error: ${err.message}`)
  }
}

handler.help = ['paste <name file> <new code>']
handler.tags = ['owner']
handler.command = /^p(aste)?$/i

handler.rowner = true

export default handler
