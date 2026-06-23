// seed-libros.js
// Importa masivamente los libros y revistas del inventario real (desde libros-seed.json)
//
// CÓMO USARLO:
// 1. Coloca este archivo y libros-seed.json en la carpeta biblioteca-backend
// 2. Asegúrate de que el backend esté corriendo (pnpm run start:dev)
// 3. Ejecuta: node seed-libros.js
// 4. Espera — son 1127 registros, puede tardar 1-2 minutos. Verás el progreso en consola.

const fs = require('fs')

const libros = JSON.parse(fs.readFileSync('./libros-seed.json', 'utf-8'))

async function crearLibros() {
  let exitosos = 0
  let fallidos = 0
  const errores = []

  console.log(`Importando ${libros.length} registros (libros y revistas)...\n`)

  for (let i = 0; i < libros.length; i++) {
    const libro = libros[i]
    try {
      const res = await fetch('http://localhost:3000/libros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libro),
      })
      if (res.ok) {
        exitosos++
      } else {
        const data = await res.json()
        fallidos++
        errores.push({ codigo: libro.codigo, error: data.message || data })
      }
    } catch (err) {
      fallidos++
      errores.push({ codigo: libro.codigo, error: err.message })
    }

    // Mostrar progreso cada 50 registros
    if ((i + 1) % 50 === 0) {
      console.log(`Progreso: ${i + 1}/${libros.length} (✔ ${exitosos} | ✘ ${fallidos})`)
    }
  }

  console.log(`\n========================================`)
  console.log(`Importación terminada.`)
  console.log(`✔ Exitosos: ${exitosos}`)
  console.log(`✘ Fallidos: ${fallidos}`)
  console.log(`========================================\n`)

  if (errores.length > 0) {
    console.log('Primeros 10 errores:')
    errores.slice(0, 10).forEach(e => console.log(`  - ${e.codigo}: ${JSON.stringify(e.error)}`))
    fs.writeFileSync('./errores-seed-libros.json', JSON.stringify(errores, null, 2))
    console.log('\nLista completa de errores guardada en errores-seed-libros.json')
  }
}

crearLibros()
