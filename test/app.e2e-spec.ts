import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
// import { like } from 'pactum-matchers';
import { AppModule } from './../src/app.module';
//import { AuthorizerService } from '../src/authorizer/authorizer.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  // let prisma: PrismaService;
  // const authorizerService: AuthorizerService = {
  //   authorize: () => Promise.resolve(true),
  // };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3001);

    // prisma = app.get(PrismaService);
    pactum.request.setBaseUrl('http://localhost:3001');
  });

  afterAll(() => {
    app.close();
  });

  describe('User', () => {
    it('Create a user', () => {
      return pactum
        .spec()
        .post('/user')
        .withBody({
          email: 'mary@example.com',
          name: 'Mary Doe',
          hash: '123',
        })
        .expectStatus(201)
        .expectJsonMatchStrict({
          id: 1,
          name: 'Mary Doe',
          email: 'mary@example.com',
        });
    });

    it('Try to create a repeated user', () => {
      return pactum
        .spec()
        .post('/user')
        .withBody({
          email: 'mary@example.com',
          name: 'Mary Doe',
          hash: '123',
        })
        .expectStatus(400)
        .expectJsonMatchStrict({
          message: ['email must be unique.'],
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });
});
