import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  let token: string | null = null;

  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('accessToken');
  }


  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq).pipe(
      catchError((err) => {
        if (err.status === 401 || err.status === 403) {
          return authService.refreshAccessToken().pipe(
            switchMap((response: any) => {
              if (response && response.token) {
                if (isPlatformBrowser(platformId)) {
                  localStorage.setItem('accessToken', response.token);
                  localStorage.setItem('refreshToken', response.refreshToken)
                }
                const retryAuthReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.token}`,
                  },
                });
                return next(retryAuthReq);
              }
              return throwError(() => err); 
            }),
            catchError((refreshErr) => {
              // if (isPlatformBrowser(platformId)) {
              //   authService.logoutUser();
              // }
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  return next(req);
};