import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'An error occurred';
    let errors: any = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const obj = exceptionResponse as any;
        message = obj.message || exception.message || 'Validation error';
        errors = obj.message || obj;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const isDbConnected = !message.toLowerCase().includes('database is not connected') && !message.toLowerCase().includes('econnrefused');
    if (!isDbConnected) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'database is not connected';
    }

    response.status(status).json({
      success: false,
      isDbConnected,
      message,
      data: null,
      errors: errors || message,
    });
  }
}
