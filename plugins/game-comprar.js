import { getUserStats, spendMoney, spendExp, setUserStats } from '../lib/stats.js'
import { activarProteccion } from '../lib/usarprote.js'

const handler = async (m, { conn, args }) => {
  const userId = m.sender
  const user = getUserStats(userId)

  const opcionesProte = [
    { horas: 2, costoDiamantes: 200, costoExp: 800, gananciaMysticcoins: 10 },
    { horas: 5, costoDiamantes: 300, costoExp: 1200, gananciaMysticcoins: 20 },
    { horas: 12, costoDiamantes: 400, costoExp: 1500, gananciaMysticcoins: 30 },
    { horas: 24, costoDiamantes: 450, costoExp: 2000, gananciaMysticcoins: 50 }
  ]

  if (!args[0]) {
    let texto = '🛡️ Opciones de Protección disponibles:\n\n'
    opcionesProte.forEach(op => {
      texto += `- ${op.horas} horas → 💎 ${op.costoDiamantes} diamantes + ✨ ${op.costoExp} Exp\n`
    })
    texto += '\nPara comprar usa:\n/comprarprote <horas>\nEjemplo: /comprarprote 5'
    await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
    return
  }

  const horas = parseInt(args[0])
  const prote = opcionesProte.find(op => op.horas === horas)

  if (!prote) {
    return conn.sendMessage(m.chat, { text: '❌ Opción inválida. Usa el comando sin parámetros para ver las opciones disponibles.' }, { quoted: m })
  }

  if (user.money < prote.costoDiamantes || user.exp < prote.costoExp) {
    let falta = []
    if (user.money < prote.costoDiamantes) falta.push('💎 diamantes')
    if (user.exp < prote.costoExp) falta.push('✨ experiencia')
    return conn.sendMessage(m.chat, { text: `❌ No tienes suficientes: ${falta.join(' y ')}` }, { quoted: m })
  }

  // Descontar diamantes y exp
  spendMoney(userId, prote.costoDiamantes)
  spendExp(userId, prote.costoExp)

  // Sumar mysticcoins directo y guardar
  user.mysticcoins = (user.mysticcoins || 0) + prote.gananciaMysticcoins
  setUserStats(userId, user)

  // Activar protección
  await activarProteccion(m, conn, horas.toString())

  // Confirmar compra y ganancia
  await conn.sendMessage(m.chat, { text: `✅ Protección comprada por ${horas} horas.\nHas ganado ${prote.gananciaMysticcoins} mysticcoins.` }, { quoted: m })
}

handler.help = ['comprarprote <horas>']
handler.tags = ['econ']
handler.command = /^comprarprote$/i

export default handler