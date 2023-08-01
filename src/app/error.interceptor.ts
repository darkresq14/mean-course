import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error.error.message) {
          errorMessage = err.error.error.message;
        }

        this.dialog.open(ErrorComponent, {
          data: { message: errorMessage },
        });
        return throwError(() => err);
      })
    );
  }
}
