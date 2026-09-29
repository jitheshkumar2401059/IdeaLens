import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';

describe('IdeaLens Frontend Components & Core Services', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the AppComponent', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize ToastService and support adding and dismissing alerts', () => {
    const toast = TestBed.inject(ToastService);
    expect(toast.toasts().length).toBe(0);

    toast.success('Test notification message', 'Test Title');
    expect(toast.toasts().length).toBe(1);
    expect(toast.toasts()[0].message).toBe('Test notification message');
    expect(toast.toasts()[0].type).toBe('success');

    toast.dismiss(toast.toasts()[0].id);
    expect(toast.toasts().length).toBe(0);
  });

  it('should provide AuthService with unauthenticated default state when storage is empty', () => {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.clear();
    }
    const auth = TestBed.inject(AuthService);
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.userRole()).toBeNull();
  });
});
