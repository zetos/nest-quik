import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import {
  APIGatewayRequestAuthorizerEvent,
  Callback,
  Context,
  Handler,
} from 'aws-lambda';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

let server: Handler;

function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Nest API')
    .setDescription('A JWT authenticated API to create posts and comments.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  setupSwagger(app);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: APIGatewayRequestAuthorizerEvent,
  context: Context,
  callback: Callback,
) => {
  if (event.path === '/api') {
    event.path = '/api/';
  }
  event.path = event.path?.includes('swagger-ui')
    ? `/api${event.path}`
    : event.path;

  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
