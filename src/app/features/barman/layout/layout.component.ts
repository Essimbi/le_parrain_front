import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';


@Component({
  selector: 'app-barman-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class BarmanLayoutComponent {
  // PAS DE setInterval - juste une propriété simple
  currentTime = new Date();

  constructor(private router: Router) {}

  logout() {
    localStorage.clear()
    this.router.navigate(['/login']);
  }

  // Méthode pour obtenir l'heure actuelle dans le template
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}