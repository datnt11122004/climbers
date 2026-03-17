import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { ApiResponse } from '../types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor() {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest<Request>();

        const traceId = request?.headers?.['x-trace-id'];

        let status: number;
        let message: string | string[];

        if (exception instanceof HttpException) {
            const httpException = exception as HttpException;
            status = httpException.getStatus();
            const res = httpException.getResponse() as
                | { message?: string | string[] }
                | string;
            message =
                typeof res === 'string'
                    ? res
                    : (res.message ?? httpException.message);
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
        }

        const res: ApiResponse<null> = ApiResponse.Error(status)
            .withMessage(message)
            .withPath(request?.url)
            .withTraceId(traceId);

        if (process.env.NODE_ENV === 'development') {
            res.withException(exception);
        }
        response.status(status).json(res);
    }
}
