import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private route: Router,
    public authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): void {
    this.loginForm = this.fb.group({
      phone: ['', [
        Validators.required, 
        // Validators.pattern(/^6[5-9]\d{7}$/)
      ]
    ],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { phone, password } = this.loginForm.value;

      this.authService.login(this.loginForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            // Gérer la redirection en fonction de la réponse du backend
            // Le backend peut renvoyer le rôle de l'utilisateur ou d'autres informations
            console.log('Connexion réussie', response);
            this.redirectBasedOnRole(response.user.role);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Erreur de connexion', err);
            this.errorMessage = 'Numéro de téléphone ou mot de passe incorrect.';
          }
        });
    } else {
      this.markAllAsTouched();
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
    }
  }

  private redirectBasedOnRole(role: string): void {
    // Si votre API renvoie le rôle, vous pouvez rediriger en fonction de celui-ci
    if (role === 'barman') {
      this.route.navigate(['barman']);
    } else if (role === 'gerant') {
      this.route.navigate(['gerant']);
    }
  }

  markAllAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // La fonction useTestAccount ne serait plus nécessaire dans une version finale,
  // car l'authentification est gérée par le backend.
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
      return 'Format: 6XXXXXXXX (8 chiffres après le 6)';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    const control = this.passwordControl;
    if (control?.errors?.['required']) {
      return 'Le mot de passe est requis';
    }
    return '';
  }
}