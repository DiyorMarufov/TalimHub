import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = config.PORT;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Courses example')
    .setDescription('The Courses API description')
    .setVersion('1.0')
    .addTag('Courses')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(PORT, () => console.log(`Server is running on port`, PORT));
}
bootstrap();
