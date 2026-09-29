import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toastService.toasts().length > 0">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-body">
          <div class="toast-title" *ngIf="toast.title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      width: calc(100% - 48px);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border-subtle);
      animation: slideIn 0.25s ease-out;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast-icon {
      font-weight: bold;
      font-size: 1rem;
      line-height: 1.4;
    }

    .toast-success {
      border-left: 4px solid var(--accent-emerald);
      .toast-icon { color: var(--accent-emerald); }
    }

    .toast-error {
      border-left: 4px solid var(--accent-rose);
      .toast-icon { color: var(--accent-rose); }
    }

    .toast-warning {
      border-left: 4px solid var(--accent-amber);
      .toast-icon { color: var(--accent-amber); }
    }

    .toast-info {
      border-left: 4px solid var(--accent-cyan);
      .toast-icon { color: var(--accent-cyan); }
    }

    .toast-body {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-main);
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.35;
    }

    .toast-close {
      color: var(--text-muted);
      font-size: 0.85rem;
      padding: 2px;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: var(--text-main);
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
