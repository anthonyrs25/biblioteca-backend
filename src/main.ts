import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  await app.listen(3000)
  console.log('Biblioteca backend corriendo en puerto 3000')
}
bootstrap()