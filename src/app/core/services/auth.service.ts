import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '../models/auth.model';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  role: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://le-parrain.mbotchakfoundation.org/api';

  private authStateSubject = new BehaviorSubject<AuthState>(this.getInitialAuthState());
  public authState$: Observable<AuthState> = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getInitialAuthState(): AuthState {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const role = localStorage.getItem('userRole');
    return {
      user: user,
      token: token,
      isAuthenticated: !!token && !!user,
      loading: false,
      error: null,
      role: role,
    };
  }

  // --- Public Getters for easier access ---
  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get userRole(): string | null {
    return this.authStateSubject.value.role;
  }

  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  // --- Authentication Methods ---

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.authStateSubject.next({ ...this.authStateSubject.value, loading: true, error: null });

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        // Store token and user info
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.user.role); // Assuming user object has a 'role' property

        this.authStateSubject.next({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          loading: false,
          error: null,
          role: response.user.role,
        });
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');

    // Reset auth state
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      role: null,
    });
  }

  // --- Error Handling ---
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      if (error.status) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error; // Backend might send a direct error message string
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
      } else {
        errorMessage = `Server Error: ${error.message}`;
      }
    }
    console.error(errorMessage);
    this.authStateSubject.next({ ...this.authStateSubject.value, loading: false, error: errorMessage });
    return throwError(() => new Error(errorMessage));
  };
}