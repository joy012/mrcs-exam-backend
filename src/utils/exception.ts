import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger('Exception Filter');
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let error = 'Internal Server Error';
    let statusCode = 500;

    console.log('actual exception: ', JSON.stringify(exception, null, 2));

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as any;
      statusCode = exception.getStatus();

      // Check if this is a Nestia validation error
      if (this.isNestiaValidationError(exceptionResponse)) {
        error = this.formatNestiaValidationError(exceptionResponse);
      } else {
        // Handle regular HttpException
        error = Array.isArray(exceptionResponse?.message)
          ? exceptionResponse.message.join(', ')
          : exceptionResponse?.message;
      }
    }

    this.logger.error(exception.message, exception.stack);

    response.status(statusCode).json({
      success: false,
      data: null,
      message: error,
    });
  }

  private isNestiaValidationError(response: any): boolean {
    const isError =
      response &&
      typeof response === 'object' &&
      response.path &&
      response.reason;
    return isError ? (response.expected as boolean) : false;
  }

  private formatNestiaValidationError(response: any): string {
    const fieldPath = response.path?.replace('$input.', '') || 'field';
    const expected = response.expected || 'valid value';

    return `Validation failed for '${fieldPath}': expected ${expected}`;
  }
}
