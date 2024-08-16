import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { findSubstringInArray } from '../util';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const code = exception.code;

    if (code === 'P2002') {
      const uniqueField: string = exception.meta.target[0];

      response.status(HttpStatus.BAD_REQUEST).json({
        message: [`${uniqueField} must be unique.`],
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    } else if (code === 'P2003') {
      const prismaField = exception.meta.field_name as string;
      const reqBodyKeys = Object.keys(request.body);
      const subString =
        findSubstringInArray(prismaField, reqBodyKeys) || 'unknown';

      response.status(HttpStatus.BAD_REQUEST).json({
        message: [`${subString} not found.`],
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    } else {
      console.error('Uncaugh PrismaClientKnownRequestError:', code, exception);

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
