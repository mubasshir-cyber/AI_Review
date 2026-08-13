import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((resData) => {
        // If data is already wrapped in envelope, pass through
        if (resData && typeof resData === 'object' && 'success' in resData && 'data' in resData) {
          return resData;
        }

        let message = 'Operation successful';
        let data = resData;

        if (resData && typeof resData === 'object' && resData.message && resData.data !== undefined) {
          message = resData.message;
          data = resData.data;
        }

        return {
          success: true,
          message,
          data,
          errors: null,
        };
      }),
    );
  }
}
