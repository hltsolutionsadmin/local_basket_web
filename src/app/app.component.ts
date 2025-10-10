import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { TokenService } from './core/service/token.service';
import { AuthService } from './auth/service/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiConfigService } from './core/service/api-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
   fcmToken = '';
  lastMessage: any;
  loading$!: Observable<boolean>;
  loadingService = inject(TokenService);
  notification: string = '';
  service = inject(AuthService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  snackBar = inject(MatSnackBar);
  apiCongig = inject(ApiConfigService)

  constructor() {
    this.loading$ = this.loadingService.loading$;
    this.getCurrentUser();
  }

  ngOnInit() {
      this.apiCongig.startPolling();
  }

  getCurrentUser(): void {
    this.loadingService.show();
    const token = this.loadingService.getAccessToken();

    if (token) {
      this.service.getCurrentUser().pipe(
        finalize(() => this.loadingService.hide())
      ).subscribe({
        next: (response: any[]) => {
          const user = response[0];
          this.loadingService.setUser(user);

          if (!user) {
            this.router.navigate(['/auth/loginRegistration']);
            return;
          }

          const isAdmin = user.roles?.some((role: { name: string }) => role.name === 'ROLE_USER_ADMIN');
          if (isAdmin) {
            this.router.navigate(['/adminScreen/adminLayout']);
            return;
          }

          const hasRestaurantOwnerRole = user.roles?.some((role: { name: string }) => role.name === 'ROLE_RESTAURANT_OWNER');

          if (hasRestaurantOwnerRole) {
            if (user.businessName) {
              localStorage.setItem('restaurantName', user.businessName)
            }

            if (user.id) {
              localStorage.setItem('restaurantId', user.id.toString());
            }

            if (user.approved === true) {
              this.router.navigate(['/layoutHome/layout']);
            } else if (user.approved === false) {
              this.router.navigate(['/auth/approvalPending'], {
                queryParams: { reason: 'not-approved' }
              });
            }
          } else {
            this.router.navigate(['/auth/restaurantRegister']);
          }
        },
        error: (err) => {
          this.loadingService.hide();
          console.error('Error fetching user data:', err);
          alert('Something went wrong, please try again later.');
          this.router.navigate(['/auth/loginRegistration']);
        }
      });
    } else {
      this.loadingService.hide();
      this.router.navigate(['/auth/loginRegistration']);
    }
  }
  }
