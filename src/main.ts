import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Validación global: cada endpoint que use un DTO con decoradores de
  // class-validator ahora sí rechaza automáticamente datos mal formados,
  // en vez de aceptar cualquier cosa (antes todos los endpoints eran `body: any`).
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // descarta campos que no están en el DTO
    forbidNonWhitelisted: false, // no rechaza la petición completa por un campo extra, solo lo ignora
    transform: true,             // convierte tipos automáticamente (ej. strings de query params a number)
  }))

  // Restringido a los orígenes reales del proyecto — antes aceptaba
  // cualquier sitio web (origin: true), lo cual es innecesariamente permisivo.
  // Se acepta el dominio de producción, localhost (desarrollo), y cualquier
  // preview deploy de Vercel de este mismo proyecto (dominios que terminan
  // en ".vercel.app" y empiezan con "biblioteca-front").
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === 'http://localhost:5173' ||
        (origin.includes('biblioteca-front') && origin.endsWith('.vercel.app'))
      ) {
        callback(null, true)
      } else {
        callback(new Error('Origen no permitido por CORS'))
      }
    },
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  await app.listen(3000)
  console.log('Biblioteca backend corriendo en puerto 3000')
}
bootstrap()