import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse, HttpError } from '../types';

@Catch(HttpError)
export class HttpErrorFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpErrorFilter.name);

    catch(exception: HttpError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.statusCode;

        const apiResponse: any = ApiResponse.Error(status).withMessage(
            exception.message
        );
        apiResponse.timestamp = new Date().toISOString();
        apiResponse.path = request.url;
        apiResponse.source = 'HttpErrorFilter';
        apiResponse.exception = exception;
        this.logger.error(exception);

        response.status(status).json(apiResponse);
    }
}
