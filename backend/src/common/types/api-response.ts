export class ApiResponse<T> {
    success!: boolean;
    statusCode?: number;
    message?: string | string[];
    path?: string;
    traceId?: string;
    timestamp: string;
    data?: T;
    meta?: Meta;
    exception?: any;

    constructor(props: Partial<ApiResponse<T>>) {
        Object.assign(this, {
            timestamp: new Date().toISOString(),
            ...props
        });
    }

    static Error<T = any>(statusCode: number) {
        return new ApiResponse<T>({
            success: false,
            statusCode
        });
    }

    static OK<T = any>(data?: T) {
        return new ApiResponse<T>({
            success: true,
            statusCode: 200,
            data
        });
    }

    static Success<T = any>(data?: T) {
        return ApiResponse.OK(data);
    }

    static list<T>(res: Pagination<T>) {
        return new ApiResponse<T[]>({
            success: true,
            statusCode: 200,
            data: res.data,
            meta: res.meta
        });
    }

    withMessage(message: string | string[]) {
        this.message = message;
        return this;
    }

    setMeta(meta: Meta) {
        this.meta = meta;
        return this;
    }

    withStatusCode(code: number) {
        this.statusCode = code;
        return this;
    }

    withTraceId(traceId: string) {
        this.traceId = traceId;
        return this;
    }

    withPath(path: string) {
        this.path = path;
        return this;
    }

    withException(exception: any) {
        this.exception = exception;
        return this;
    }
}

export type Meta = {
    limit?: number;
    total?: number;
    page?: number;
};

export type Pagination<T = any> = {
    data: T[];
    meta: Meta;
};
