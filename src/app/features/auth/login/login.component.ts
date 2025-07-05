import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  private destroy$ = new Subject<void>();

  // Comptes de test pour affichage
  testAccounts = [
    { role: 'Admin', phone: '237123456789', password: 'admin123' },
    { role: 'Barman', phone: '237987654321', password: 'barman123' },
    { role: 'Serveur', phone: '237555666777', password: 'serveur123' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
   /* if (this.authService.isAuthenticated) {
      this.redirectBasedOnRole();
    }

    // Écouter les changements d'état d'auth
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state.loading;
        this.errorMessage = state.error || '';
      });
      */
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.loginForm = this.fb.group({
      phone: ['', [
        Validators.required,
        Validators.pattern(/^237[0-9]{9}$/) // Format téléphone camerounais
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  private redirectBasedOnRole(): void {
   /* const role = this.authService.userRole;
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'barman':
        this.router.navigate(['/barman']);
        break;
      case 'serveur':
        this.router.navigate(['/serveur']);
        break;
      default:
        this.router.navigate(['/']);
    }*/
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      const credentials: LoginRequest = this.loginForm.value;
      
     /* this.authService.login(credentials)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Connexion réussie:', response.user.name);
          },
          error: (error) => {
            console.error('Erreur de connexion:', error);
          }
        });*/
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Méthodes pour les comptes de test
  useTestAccount(account: any): void {
    this.loginForm.patchValue({
      phone: account.phone,
      password: account.password
    });
  }

  // Getters pour le template
  get phoneControl() {
    return this.loginForm.get('phone');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  get isPhoneInvalid(): boolean {
    const control = this.phoneControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isPasswordInvalid(): boolean {
    const control = this.passwordControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get phoneErrorMessage(): string {
    const control = this.phoneControl;
    if (control?.errors?.['required']) {
      return 'Le numéro de téléphone est requis';
    }
    if (control?.errors?.['pattern']) {
      return 'Format: 237XXXXXXXXX (9 chiffres après 237)';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    const control = this.passwordControl;
    if (control?.errors?.['required']) {
      return 'Le mot de passe est requis';
    }
    if (control?.errors?.['minlength']) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }
}