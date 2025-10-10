import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginRegistrationComponent } from './components/login-registration/login-registration.component';
import { RestaurantRegisterComponent } from './components/restaurant-register/restaurant-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './service/auth.service';
import { ApprovalPendingComponent } from './components/approval-pending/approval-pending.component';
import { HLTReusableLibModule } from 'hlt-reusable-lib';
import { LocationDialogComponent } from './components/location-dialog/location-dialog.component'
import { MatDialogModule } from '@angular/material/dialog';
import { GoogleMapsModule } from '@angular/google-maps'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    LoginRegistrationComponent,
    RestaurantRegisterComponent,
    ApprovalPendingComponent,
    LocationDialogComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HLTReusableLibModule,
    MatDialogModule,
    GoogleMapsModule,
    MatProgressSpinnerModule
  ],
  providers: [
    AuthService ,
    //provideGoogleMaps({ apiKey: environment.googleMapsApiKey }),
  ],
})
export class AuthModule { }
