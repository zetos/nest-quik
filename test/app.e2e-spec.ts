import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { like, notEquals } from 'pactum-matchers';
import { AppModule } from '../src/app.module';
import { Tokens } from '../src/auth/types';
import { SignInDto, SignUpDto } from '../src/auth/dto';
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

  let tokens: Tokens;

  describe('Auth', () => {
    describe('Signup', () => {
      const signupDto: SignUpDto = {
        name: 'Granny Weatherwax',
        email: 'esme_weather@discw.com',
        password: 'TPratchett',
      };

      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: signupDto.password,
          })
          .expectStatus(400)
          .expectJsonMatchStrict({
            message: [
              'name must be a string',
              'name should not be empty',
              'email should not be empty',
              'email must be an email',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
      });

      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signupDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201)
          .expectJsonMatchStrict({
            access_token: like(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjM3NTM4ODB9.UoE34Eh8nLiTstmfocfKNpV6MyGJ5Z4KysAZHf1_XvA',
            ),
            refresh_token: like(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjQyNzEzODB9.9A2AwxtMPxl8SBK-vdQSK9AKv68JfUbLrIdniRTKU2o',
            ),
          });
      });

      it('should throw if trying to create a repeated user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(400)
          .expectJsonMatchStrict({
            message: ['email must be unique.'],
            error: 'Bad Request',
            statusCode: 400,
          });
      });
    });

    describe('Signin', () => {
      const signinDto: SignInDto = {
        email: 'esme_weather@discw.com',
        password: 'TPratchett',
      };

      it('should signin', async () => {
        const r = pactum
          .spec()
          .post('/auth/signin')
          .withBody(signinDto)
          .expectStatus(200)
          .expectJsonMatchStrict({
            access_token: like(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjM3NTM4ODB9.UoE34Eh8nLiTstmfocfKNpV6MyGJ5Z4KysAZHf1_XvA',
            ),
            refresh_token: like(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjQyNzEzODB9.9A2AwxtMPxl8SBK-vdQSK9AKv68JfUbLrIdniRTKU2o',
            ),
          })
          .returns((ctx) => {
            tokens = ctx.res.json as Tokens;
            return tokens;
          });

        return r;
      });
    });

    describe('Refresh token', () => {
      it('should fail with a bad refresh_token', async () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders({ Authorization: `Bearer bad_token` })
          .expectStatus(401)
          .expectJsonMatchStrict({
            message: 'Unauthorized',
            statusCode: 401,
          });
      });

      it('should generate a new refresh token', async () => {
        // wait for 1s to a different token.
        await new Promise((resolve, _reject) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        });

        const oldRefreshToken = tokens.refresh_token;

        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders({ Authorization: `Bearer ${oldRefreshToken}` })
          .expectStatus(200)
          .expectJsonMatchStrict({
            access_token: like(tokens.access_token),
            refresh_token: notEquals(tokens.refresh_token),
          });
      });
    });

    describe('Logout', () => {
      it('should logout', async () => {
        return pactum
          .spec()
          .post('/auth/logout')
          .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
          .expectStatus(200)
          .expectBody('true');
      });
    });
  });

  describe('User', () => {
    it('Get my info', () => {
      return pactum
        .spec()
        .get('/user/me')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(200)
        .expectJsonMatchStrict({
          name: 'Granny Weatherwax',
          email: 'esme_weather@discw.com',
        });
    });

    it('Patch my user', () => {
      return pactum
        .spec()
        .patch('/user/me')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          email: 'e_weather@discw.com',
        })
        .expectStatus(200)
        .expectJsonMatchStrict({
          name: 'Granny Weatherwax',
          email: 'e_weather@discw.com',
        });
    });
  });

  describe('Post', () => {
    it('creates a new post', () => {
      return pactum
        .spec()
        .post('/post')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          title: 'First Post !!',
          description: 'bad description..',
        })
        .expectStatus(201)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          likes: 0,
          dislikes: 0,
          userId: 1,
          title: 'First Post !!',
          description: 'bad description..',
          imageUrl: null,
        });
    });

    it('updated a post', () => {
      return pactum
        .spec()
        .patch('/post/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          description: 'good description.',
        })
        .expectStatus(200)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          likes: 0,
          dislikes: 0,
          userId: 1,
          title: 'First Post !!',
          description: 'good description.',
          imageUrl: null,
        });
    });

    it('should fail to updated a non existent post', () => {
      return pactum
        .spec()
        .patch('/post/100')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          description: 'good description.',
        })
        .expectStatus(404)
        .expectJsonMatchStrict({
          error: 'Not Found',
          message: ['Not found.'],
          statusCode: 404,
        });
    });

    it('get a post with comments and views', () => {
      return pactum
        .spec()
        .get('/post/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(200)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          likes: 0,
          dislikes: 0,
          userId: 1,
          title: 'First Post !!',
          description: 'good description.',
          imageUrl: null,
          comments: [],
          views: 1,
        });
    });

    it('patches a post with a rating (dislike)', () => {
      return pactum
        .spec()
        .patch('/post/rate/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          rate: 'dislike',
        })
        .expectStatus(200)
        .expectBody('true');
    });

    it('get a post with updated dislikes', () => {
      return pactum
        .spec()
        .get('/post/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(200)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          likes: 0,
          dislikes: 1,
          userId: 1,
          title: 'First Post !!',
          description: 'good description.',
          imageUrl: null,
          comments: [],
          views: 1,
        });
    });

    it('patches a post with a rating (like)', () => {
      return pactum
        .spec()
        .patch('/post/rate/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          rate: 'like',
        })
        .expectStatus(200)
        .expectBody('true');
    });

    it('get a post with updated dislikes', () => {
      return pactum
        .spec()
        .get('/post/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(200)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          likes: 1,
          dislikes: 0,
          userId: 1,
          title: 'First Post !!',
          description: 'good description.',
          imageUrl: null,
          comments: [],
          views: 1,
        });
    });

    it('creates a new post soon to be deleted', () => {
      return pactum
        .spec()
        .post('/post')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          title: 'Ephemeral Post !!',
          description: 'ephemeral description..',
        })
        .expectStatus(201)
        .expectJsonMatchStrict({
          id: 2,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          likes: 0,
          dislikes: 0,
          userId: 1,
          title: 'Ephemeral Post !!',
          description: 'ephemeral description..',
          imageUrl: null,
        });
    });

    it('should delete a post', () => {
      return pactum
        .spec()
        .delete('/post/2')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(200)
        .expectBody('true');
    });

    it('should fail to delete a non existent post', () => {
      return pactum
        .spec()
        .delete('/post/200')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(404)
        .expectJsonMatchStrict({
          error: 'Not Found',
          message: ['Not found.'],
          statusCode: 404,
        });
    });
  });

  describe('Comment', () => {
    it('creates a new comment in a post', () => {
      return pactum
        .spec()
        .post('/comment')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          postId: 1,
          description: 'a bad comment..',
        })
        .expectStatus(201)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          userId: 1,
          postId: 1,
          description: 'a bad comment..',
        });
    });

    it('should update a commentary', () => {
      return pactum
        .spec()
        .patch('/comment/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          description: 'a good comment.',
        })
        .expectStatus(200)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          userId: 1,
          postId: 1,
          description: 'a good comment.',
        });
    });

    it('creates a new comment soon to be deleted', () => {
      return pactum
        .spec()
        .post('/comment')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .withBody({
          postId: 1,
          description: 'another bad comment..',
        })
        .expectStatus(201)
        .expectJsonMatchStrict({
          id: 2,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          userId: 1,
          postId: 1,
          description: 'another bad comment..',
        });
    });

    it('should delete a comment', () => {
      return pactum
        .spec()
        .delete('/comment/2')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(200)
        .expectBody('true');
    });

    it('should fail to delete a non existent comment', () => {
      return pactum
        .spec()
        .delete('/comment/200')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(404)
        .expectBody({
          error: 'Not Found',
          message: ['Not found.'],
          statusCode: 404,
        });
    });

    it('get a post with comments and views', () => {
      return pactum
        .spec()
        .get('/post/1')
        .withHeaders({ Authorization: `Bearer ${tokens.access_token}` })
        .expectStatus(200)
        .expectJsonMatchStrict({
          id: 1,
          createdAt: like('2024-08-15T23:23:28.164Z'),
          updatedAt: like('2024-08-15T23:23:28.183Z'),
          likes: 1,
          dislikes: 0,
          userId: 1,
          title: 'First Post !!',
          description: 'good description.',
          imageUrl: null,
          comments: [
            {
              id: 1,
              createdAt: like('2024-08-15T23:23:28.164Z'),
              updatedAt: like('2024-08-15T23:23:28.183Z'),
              wasDeletedByUserWithId: null,
              userId: 1,
              postId: 1,
              description: 'a good comment.',
            },
          ],
          views: 1,
        });
    });
  });

  describe('Report', () => {
    it('should get a report of all posts', () => {
      return pactum
        .spec()
        .get('/report')
        .expectStatus(200)
        .expectJsonMatchStrict([
          {
            title: 'First Post !!',
            numberOfComments: 2,
            views: 1,
            likes: 1,
            dislikes: 0,
          },
        ]);
    });
  });
});
