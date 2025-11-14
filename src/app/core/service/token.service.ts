import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { BusinessUser } from '../interface/eatoInterface';


@Injectable({
  providedIn: 'root'
})
export class TokenService {
  //  spinner component logic start
  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  apiConfig = inject(ApiConfigService);
  http = inject(HttpClient);


  
  //  token Storing functionality
  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('restaurantId')
  }

  //  token Storing functionality end
   

  show() {
    this.loadingSubject.next(true);
  }

  hide() {
    this.loadingSubject.next(false);
  }
   //  spinner component logic end

  // current user functionality start
 private userSubject = new BehaviorSubject<BusinessUser  | null>(null);

 user$: Observable<BusinessUser  | null> = this.userSubject.asObservable()

 setUser(user: BusinessUser ): void {
    this.userSubject.next(user);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }

  getCurrentUserValue(): BusinessUser  | null {
    return this.userSubject.getValue();
  }

    updateOnlineStatus(restaurantId: string | number, enabled: boolean): Observable<any> {
  const baseUrl = this.apiConfig.getEndpoint('BusinessEndpoint');
  const url = `${baseUrl}/${restaurantId}/status`;
  const params = new HttpParams().set('enabled', enabled);

  // ✅ Expect a plain text or empty response
  return this.http.put(url, null, {
    params,
    responseType: 'text', // <-- This fixes the "Unknown Error" 200 bug
  }).pipe(
    catchError((error) => {
      console.error('Failed to update online status', error);
      return throwError(() => new Error('Unable to update online status.'));
    })
  );
}

getBusinessDetails(restaurantId: string | number): Observable<any> {
  const baseUrl = this.apiConfig.getEndpoint('BusinessEndpoint');
  const url = `${baseUrl}/${restaurantId}`;

  return this.http.get(url).pipe(
    catchError((error) => {
      console.error('Failed to fetch business details', error);
      return throwError(() => new Error('Unable to fetch business details.'));
    })
  );
}

  // Upsert business (create or update) via FormData using the onboard API
  upsertBusiness(form: FormData): Observable<any> {
    const baseUrl = this.apiConfig.getEndpoint('BusinessEndpoint');
    const url = `${baseUrl}/onboard`;
    return this.http.post(url, form).pipe(
      catchError((error) => {
        console.error('Failed to upsert business', error);
        return throwError(() => new Error('Unable to save business details.'));
      })
    );
  }
}
