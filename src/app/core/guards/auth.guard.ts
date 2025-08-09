// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.authState$.pipe(
      map(state => state.isAuthenticated), // On mappe l'état d'authentification
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          // Si l'utilisateur n'est PAS authentifié, redirige vers la page de connexion
          this.router.navigate(['/login']);
        }
      }),
      catchError(() => {
        // En cas d'erreur (bien que peu probable ici), on redirige aussi
        this.router.navigate(['/login']);
        return of(false); // Retourne false pour bloquer l'accès
      })
    );
  }
}