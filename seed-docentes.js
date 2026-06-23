// seed-docentes.js
// Script para crear varios docentes de una sola corrida, sin hacerlo uno por uno en Postman.
//
// CÓMO USARLO:
// 1. Asegúrate de que el backend esté corriendo (pnpm run start:dev)
// 2. Desde la carpeta biblioteca-backend, ejecuta: node seed-docentes.js
// 3. Revisa la consola: te dirá si cada docente se creó bien o si hubo error (ej: rfid duplicado)

const docentes = [
  {
    rfid: 'DEMO-001',
    nombre: 'Ing. Paul Tigre',
    iniciales: 'PT',
    carreras: [
      {
        nombre: 'Desarrollo de Software',
        ciclos: [
          { numero: 2, materias: ['Proyecto Integrador de Saberes', 'Sistemas Digitales Programables'] },
        ],
      },
    ],
  },
  {
    rfid: 'DEMO-002',
    nombre: 'Ing. Jhostin Vacacela Saca',
    iniciales: 'JV',
    carreras: [
      {
        nombre: 'Desarrollo de Software',
        ciclos: [
          { numero: 2, materias: ['Programación Orientada a Objetos'] },
        ],
      },
    ],
  },
  {
    rfid: 'DEMO-003',
    nombre: 'Ing. Telmo Durazno Silva',
    iniciales: 'TD',
    carreras: [
      {
        nombre: 'Desarrollo de Software',
        ciclos: [
          { numero: 2, materias: ['Sistemas de Información'] },
        ],
      },
    ],
  },
  {
    rfid: 'DEMO-004',
    nombre: 'Ing. Stephany Aldas Perez',
    iniciales: 'SA',
    carreras: [
      {
        nombre: 'Desarrollo de Software',
        ciclos: [
          { numero: 2, materias: ['Procesos Contables'] },
        ],
      },
    ],
  },
]

async function crearDocentes() {
  for (const docente of docentes) {
    try {
      const res = await fetch('http://localhost:3000/docentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docente),
      })
      const data = await res.json()
      if (res.ok) {
        console.log(`✔ Creado: ${docente.nombre} (id: ${data.id})`)
      } else {
        console.log(`✘ Error con ${docente.nombre}:`, data.message || data)
      }
    } catch (err) {
      console.log(`✘ Fallo de conexión con ${docente.nombre}:`, err.message)
    }
  }
}

crearDocentes()
