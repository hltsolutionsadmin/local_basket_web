import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { OtpRequestPayload, ValidateOtpPayload } from '../../model/interface.auth';
import { finalize, take } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { TokenService } from '../../../core/service/token.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-registration',
  standalone: false,
  templateUrl: './login-registration.component.html',
  styleUrls: ['./login-registration.component.scss'],
})
export class LoginRegistrationComponent {

  private readonly OTP_LENGTH = 6;
  private readonly MOBILE_NUMBER_PATTERN = /^\d{10}$/;
  private readonly ERROR_MESSAGES = {
    INVALID_MOBILE: 'Please enter a valid 10-digit mobile number.',
    INVALID_OTP: 'Please enter a valid 6-digit OTP.',
    USER_NOT_FOUND: 'User not found. Please try again.',
    INVALID_OTP_CODE: 'Invalid OTP. Please try again.',
    GENERIC_ERROR: 'Something went wrong.',
  };

  // Form and state
  loginForm: FormGroup;
  showOtpScreen = false;
  errorMessage = '';
  otp: string[] = Array(this.OTP_LENGTH).fill('');
  otpLogin: string | null = null;
  responseOtp: string | null = null;
  sendingOtp = false;
  verifyingOtp = false;

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      mobileNumber: ['', [Validators.required, Validators.pattern(this.MOBILE_NUMBER_PATTERN)]],
    });
  }

  async sendOtp(): Promise<void> {
    if (this.sendingOtp) return;
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      this.errorMessage = this.ERROR_MESSAGES.INVALID_MOBILE;
      return;
    }

    this.errorMessage = '';
    this.tokenService.show();
    this.sendingOtp = true;
    const payload: OtpRequestPayload = {
      primaryContact: String(this.loginForm.value.mobileNumber || '').trim(),
      otpType: 'SIGNIN',
    };

    try {
      const res = await lastValueFrom(
        this.authService
          .loginTriggerOTP(payload)
          .pipe(take(1), finalize(() => { this.tokenService.hide(); this.sendingOtp = false; }))
      );
      this.otpLogin = res.otp;
      this.showOtpScreen = true;
    } catch (err: any) {
      this.handleError(err, this.ERROR_MESSAGES.USER_NOT_FOUND);
      this.sendingOtp = false;
    }
  }

  async verifyOtp(): Promise<void> {
    if (this.verifyingOtp) return;
    const otpCode = this.otp.join('');
    if (otpCode.length !== this.OTP_LENGTH || !/^\d{6}$/.test(otpCode)) {
      this.errorMessage = this.ERROR_MESSAGES.INVALID_OTP;
      return;
    }

    this.errorMessage = '';
    this.tokenService.show();
    this.verifyingOtp = true;
    const payload: ValidateOtpPayload = {
      primaryContact: String(this.loginForm.value.mobileNumber || '').trim(),
      otp: otpCode,
    };

    try {
      const res = await lastValueFrom(
        this.authService
          .validateOtp(payload)
          .pipe(take(1), finalize(() => { this.tokenService.hide(); this.verifyingOtp = false; }))
      );
      this.responseOtp = res.otp;
      localStorage.setItem('accessToken', res.token);
      localStorage.setItem('refreshToken', res.refreshToken);
      await this.getCurrentUser();
    } catch (err: any) {
      this.handleError(err, this.ERROR_MESSAGES.INVALID_OTP_CODE);
      this.otp = Array(this.OTP_LENGTH).fill('');
      this.verifyingOtp = false;
    }
  }

  async getCurrentUser(): Promise<void> {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      this.tokenService.hide();
      await this.router.navigate(['/auth/loginRegistration']);
      return;
    }

    this.tokenService.show();
    try {
      const response = await lastValueFrom(
        this.authService.getCurrentUser().pipe(take(1), finalize(() => this.tokenService.hide()))
      );
      const user = response[0];

      if (!user) {
        await this.router.navigate(['/auth/loginRegistration']);
        return;
      }

      const isAdmin = user.roles?.some((role: { name: string }) => role.name === 'ROLE_USER_ADMIN');
      if (isAdmin) {
        await this.router.navigate(['/adminScreen/adminLayout']);
        return;
      }

      const hasRestaurantOwnerRole = user.roles?.some((role: { name: string }) => role.name === 'ROLE_RESTAURANT_OWNER');
      if (hasRestaurantOwnerRole) {
        if (user.businessName) {
          localStorage.setItem('restaurantName', user.businessName);
        }
        if (user.id) {
          localStorage.setItem('restaurantId', user.id.toString());
        }
        if (user.approved) {
          await this.router.navigate(['/layoutHome/layout']);
        } else {
          await this.router.navigate(['/auth/approvalPending'], { queryParams: { reason: 'not-approved' } });
        }
      } else {
        await this.router.navigate(['/auth/restaurantRegister']);
      }
    } catch (err) {
      this.tokenService.hide();
      console.error('Error fetching user data:', err);
      alert(this.ERROR_MESSAGES.GENERIC_ERROR);
      await this.router.navigate(['/auth/loginRegistration']);
    }
  }

  resetForm(): void {
    this.loginForm.reset();
    this.otp = Array(this.OTP_LENGTH).fill('');
    this.errorMessage = '';
    this.showOtpScreen = false;
    this.otpLogin = null;
    this.responseOtp = null;
  }

  changeNumber(): void {
    this.resetForm();
  }

  onMobileNumberChange(mobileNumber: string): void {
    this.loginForm.get('mobileNumber')?.setValue(mobileNumber);
  }

  onOtpChange(otp: string[]): void {
    this.otp = otp;
  }

  private handleError(err: any, specificError: string): void {
    this.tokenService.hide();
    if (err.status === 404 && err.error?.errorCode === 1000) {
      this.errorMessage = specificError;
      window.alert(specificError);
    } else if (err.status === 401 && err.error?.errorCode === 1003) {
      this.errorMessage = specificError;
      window.alert(specificError);
    } else {
      const message = err.error?.errorMessage ?? this.ERROR_MESSAGES.GENERIC_ERROR;
      this.errorMessage = message;
      window.alert(message);
    }
  }
}