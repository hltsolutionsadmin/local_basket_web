import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { LayoutHomeModule } from './layout-home/layout-home.module';
import { MenuManagementModule } from './menu-management/menu-management.module';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar'; // Import the module
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup, MatRadioModule } from '@angular/material/radio';
import { HLTReusableLibModule } from 'hlt-reusable-lib';
import { AdminScreenModule } from './admin-screen/admin-screen.module';
import { ApiConfigService } from './core/service/api-config.service';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ConfirmDialogComponent } from './core/components/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsComponent } from './core/components/notifications/notifications.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileComponent } from './core/components/profile/profile.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export function initializeApiConfig(apiConfigService: ApiConfigService) {
  return () => apiConfigService.loadConfig();
}

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    NotificationsComponent,
    LayoutComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    LayoutHomeModule,
    MenuManagementModule,
    AdminScreenModule,
    RouterOutlet,
    MatIconModule,
    MatIcon,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatError,
    MatInputModule,
    FormsModule,
    MatOption,
    MatSelectModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatRadioModule,
    MatRadioButton,
    MatRadioGroup,
    HLTReusableLibModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    MatBadgeModule,
    MatSlideToggleModule
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAppInitializer(() => inject(ApiConfigService).loadConfig()),
     { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
