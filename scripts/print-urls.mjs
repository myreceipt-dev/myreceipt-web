import os from 'node:os'

const PORT = process.argv[2] || '3001'

const interfaces = os.networkInterfaces()
const urls = []

for (const [name, addrs] of Object.entries(interfaces)) {
  if (!addrs) continue
  for (const addr of addrs) {
    // 跳过 IPv6 和 loopback
    if (addr.family !== 'IPv4' || addr.internal) continue
    urls.push(`  http://${addr.address}:${PORT}`)
  }
}

if (urls.length > 0) {
  console.log('\n  \x1b[36m🌐 LAN 访问地址:\x1b[0m')
  urls.forEach((u) => console.log(u))
  console.log()
}
