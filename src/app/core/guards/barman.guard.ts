// src/app/core/guards/barman.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BarmanGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.authState$.pipe(
      map(state => {
        // Vérifie si l'utilisateur est authentifié ET a le rôle "barman"
        return state.isAuthenticated && state.role === 'barman';
      }),
      tap(hasBarmanRole => {
        if (!hasBarmanRole) {
          // Si l'utilisateur n'est PAS un barman (ou pas authentifié),
          // redirige vers un tableau de bord par défaut ou une page d'accès refusé
          // Vous pouvez choisir de rediriger vers le login si pas authentifié du tout
          // Ou vers un dashboard pour les utilisateurs authentifiés mais sans le bon rôle
          if (!this.authService.isAuthenticated) {
            this.router.navigate(['/login']); // Redirige vers le login si non connecté
          } else {
            // Utilisateur connecté mais n'est pas barman
            this.router.navigate(['/login']); // Redirige vers un dashboard général
            alert("Vous n'avez pas les permissions pour accéder à cette page (Rôle Barman requis).");
          }
        }
      }),
      catchError(() => {
        // En cas d'erreur lors de la récupération de l'état (peu probable)
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}