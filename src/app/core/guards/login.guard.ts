import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  // const tokenService = inject(TokenService);
  // const router = inject(Router);

  // if (tokenService.getAccessToken()) {
  //   router.navigate(['/layoutHome/layout']);
  //   return false;
  // }
  return true;
};
