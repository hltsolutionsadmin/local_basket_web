import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  // const tokenService = inject(TokenService);
  // const router = inject(Router);

  // if (tokenService.getAccessToken()) {
  //   return true;
  // }
  // router.navigate(['auth/loginRegistration']);
  return false;
};
