import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { OtpRequestPayload, RestaurentRegister, ValidateOtpPayload } from '../model/interface.auth';
import { TokenService } from '../../core/service/token.service';
import { ApiConfigService } from '../../core/service/api-config.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  http = inject(HttpClient);
  tokenService = inject(TokenService);
  apiConfig = inject(ApiConfigService)

    jsonHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    loginTriggerOTP(payload: OtpRequestPayload): Observable<any> {
      const loginUrl = this.apiConfig.getEndpoint('loginTriggerOtp');
      return this.http.post<any>(loginUrl, payload);
  }

    validateOtp(payload: ValidateOtpPayload): Observable<any> {
      const validateUrl = this.apiConfig.getEndpoint('validateMobileOtp');
        return this.http.post<any>(validateUrl, payload);
    }

    restaurentRegistration(payload: RestaurentRegister): Observable<any> {
      const restaurantUrl = this.apiConfig.getEndpoint('restaurentRegister');
        return this.http.post<any>(restaurantUrl, payload);
    }

    refreshAccessToken(): Observable<any> {
      const refreshToken = this.tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token not available.');
      }
      const refreshUrl = this.apiConfig.getEndpoint('refreshTokenUrl');
      const payload = { refreshToken: refreshToken };
  
      return this.http.post<any>(refreshUrl, payload);
    }
  
    logoutUser(): void {
      this.tokenService.clearTokens();
    }

    getCurrentUser(): Observable<any> {
      const currentUserUrl = this.apiConfig.getEndpoint('getCurrentUser');
      return this.http.get<any>(currentUserUrl);
    } 

  assignRole(): Observable<any> {
    const assignRoleUrl = this.apiConfig.getEndpoint('addRestaurantRole');
    return this.http.put(assignRoleUrl, {});
  }

  getLocationService(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        response => {
          resolve({
            Latitude: response.coords.latitude,
            Longitude: response.coords.longitude
          });
        },
        error => reject(error)
      );
    });
  }
}



