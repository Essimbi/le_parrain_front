import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

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

  // Comptes de test statiques pour le barman
  testAccounts = [
    { role: 'Barman 1', phone: '678901234', password: 'password1' },
    { role: 'Barman 2', phone: '698765432', password: 'password2' }
  ];

  constructor(private fb: FormBuilder, private route: Router) {
    this.createForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): void {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^6[5-9]\d{7}$/)]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { phone, password } = this.loginForm.value;

      // Vérification statique des comptes de test
      const user = this.testAccounts.find(account => account.phone === phone && account.password === password);
      if (user) {
        this.errorMessage = '';
        console.log('Connexion réussie pour', user.role);
        this.redirectBasedOnRole(user.role);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Numéro de téléphone ou mot de passe incorrect.';
      }
    } else {
      this.markAllAsTouched();
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
    }
  }

  private redirectBasedOnRole(role: string): void {
    this.route.navigate(['barman'])
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