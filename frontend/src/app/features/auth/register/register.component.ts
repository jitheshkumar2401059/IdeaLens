import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="auth-header">
          <h2>Create Your <span class="gradient-text">IdeaLens</span> Account</h2>
          <p>Collaborative AI idea engineering for students & academic advisors</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="e.g. Alex Morgan"
              [class.input-error]="isFieldInvalid('name')"
            />
            <div class="error-msg" *ngIf="isFieldInvalid('name')">
              Full name is required
            </div>
          </div>

          <div class="form-group">
            <label for="email">Institutional Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="e.g. alex.m@idealens.edu"
              [class.input-error]="isFieldInvalid('email')"
            />
            <div class="error-msg" *ngIf="isFieldInvalid('email')">
              Please enter a valid academic email address
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="role">Account Role</label>
              <select id="role" formControlName="role">
                <option value="student">Student Innovator</option>
                <option value="faculty">Faculty Advisor / Reviewer</option>
              </select>
            </div>

            <div class="form-group">
              <label for="department">Department</label>
              <input
                id="department"
                type="text"
                formControlName="department"
                placeholder="e.g. CSE / AI"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="At least 6 characters"
              [class.input-error]="isFieldInvalid('password')"
            />
            <div class="error-msg" *ngIf="isFieldInvalid('password')">
              Password must be at least 6 characters long
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Repeat password"
              [class.input-error]="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched"
            />
            <div class="error-msg" *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
              Passwords do not match
            </div>
          </div>

          <button type="submit" class="btn btn-primary auth-submit-btn" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="isLoading" class="animate-spin">⏳</span>
            <span>{{ isLoading ? 'Creating Account...' : 'Create IdeaLens Account' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>Already registered? </span>
          <a routerLink="/login">Sign in here</a>
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
      background: radial-gradient(circle at top left, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
                  radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.1) 0%, transparent 60%);
    }

    .auth-card {
      width: 100%;
      max-width: 520px;
      padding: 36px 32px;
      border: 1px solid var(--border-strong);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .auth-header h2 {
      font-size: 1.5rem;
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

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; }
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['student', Validators.required],
        department: ['Computer Science and Engineering'],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const { name, email, password, role, department } = this.registerForm.value;

    this.authService.register({ name, email, password, role, department }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err.error?.message || 'Registration failed. Please check inputs.');
      }
    });
  }
}
