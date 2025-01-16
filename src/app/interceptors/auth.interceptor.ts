import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  if (typeof window === 'undefined') router.navigate(['https://google.com']);

  const authService = inject(AuthService); // Inyección del servicio AuthService
  const token = authService.getToken();

  if (token) {
    // Clona la petición y agrega el token como parámetro
    const clonedRequest = req.clone({
      setParams: { token },
    });
    return next(clonedRequest).pipe(
      catchError((error) => {

        if (error.status === 401) {
          authService.logout(); // Limpia cualquier dato de sesión almacenado
          router.navigate(['/login']); // Redirige al login
        }

        return throwError(() => error);
      })
    );
  }

  return next(req)
};
