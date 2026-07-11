const puppeteer = require('puppeteer-core')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const OUT_DIR =
  'C:/Users/udit0/AppData/Local/Temp/claude/C--Udit-gotech-projects-Parallax-Effect-websit/234df7eb-aeda-4faf-a3fa-971a1bd4250e/scratchpad'

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://localhost:5188/', { waitUntil: 'networkidle0' })
  await sleep(300)

  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel({ deltaY: 100 })
    await sleep(150)
  }
  await sleep(700)
  await page.screenshot({ path: `${OUT_DIR}/cover-0.png` })

  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel({ deltaY: 100 })
    await sleep(700)
  }
  await page.screenshot({ path: `${OUT_DIR}/cover-1.png` })

  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel({ deltaY: 100 })
    await sleep(700)
  }
  await page.screenshot({ path: `${OUT_DIR}/cover-2.png` })

  await browser.close()
})()
