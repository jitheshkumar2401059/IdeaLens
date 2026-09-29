import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="auth-header">
          <div class="brand-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2>Sign in to <span class="gradient-text">IdeaLens</span></h2>
          <p>AI Project Idea & Novelty Analysis Platform</p>
        </div>

        <!-- Quick Demo Credentials Selector -->
        <div class="quick-demo-box">
          <span class="demo-title">Quick Demo Login:</span>
          <div class="demo-buttons">
            <button type="button" class="demo-btn student" (click)="fillCredentials('student@idealens.edu')">
              👨‍🎓 Student
            </button>
            <button type="button" class="demo-btn faculty" (click)="fillCredentials('faculty@idealens.edu')">
              👨‍🏫 Faculty
            </button>
            <button type="button" class="demo-btn admin" (click)="fillCredentials('admin@idealens.edu')">
              🛡️ Admin
            </button>
          </div>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Institutional Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="e.g. student@idealens.edu"
              [class.input-error]="isFieldInvalid('email')"
            />
            <div class="error-msg" *ngIf="isFieldInvalid('email')">
              Please enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              [class.input-error]="isFieldInvalid('password')"
            />
            <div class="error-msg" *ngIf="isFieldInvalid('password')">
              Password is required (minimum 6 characters)
            </div>
          </div>

          <button type="submit" class="btn btn-primary auth-submit-btn" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="isLoading" class="animate-spin">⏳</span>
            <span>{{ isLoading ? 'Signing in...' : 'Sign In to Portal' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>Don't have an account? </span>
          <a routerLink="/register">Register here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - var(--navbar-height));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, transparent 60%),
                  radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.1) 0%, transparent 60%);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 36px 32px;
      border: 1px solid var(--border-strong);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .brand-logo-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      border-radius: var(--radius-md);
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }

    .auth-header h2 {
      font-size: 1.6rem;
      margin-bottom: 6px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .auth-header p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .quick-demo-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px;
      margin-bottom: 24px;
    }

    .demo-title {
      display: block;
      font-size: 0.725rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .demo-buttons {
      display: flex;
      gap: 8px;
    }

    .demo-btn {
      flex: 1;
      padding: 6px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s;
    }

    .demo-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--border-strong);
    }

    .demo-btn.student:hover { border-color: var(--accent-cyan); color: var(--accent-cyan); }
    .demo-btn.faculty:hover { border-color: var(--accent-amber); color: var(--accent-amber); }
    .demo-btn.admin:hover { border-color: var(--accent-rose); color: var(--accent-rose); }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .input-error {
      border-color: var(--accent-rose) !important;
    }

    .error-msg {
      font-size: 0.75rem;
      color: var(--accent-rose);
    }

    .auth-submit-btn {
      margin-top: 8px;
      width: 100%;
      padding: 12px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  fillCredentials(email: string) {
    this.loginForm.patchValue({
      email,
      password: 'Password123!'
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
