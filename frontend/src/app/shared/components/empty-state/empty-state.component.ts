import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-box">
      <div class="empty-icon">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-desc">{{ description }}</p>
      <button *ngIf="actionLabel" class="btn btn-primary" (click)="actionClicked.emit()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state-box {
      text-align: center;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--bg-card);
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-lg);
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.8;
    }
    .empty-title {
      font-size: 1.2rem;
      margin-bottom: 8px;
    }
    .empty-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      max-width: 420px;
      margin-bottom: 20px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = '🔍';
  @Input() title: string = 'No Items Found';
  @Input() description: string = 'There are no items to display at this moment.';
  @Input() actionLabel: string = '';
  @Output() actionClicked = new EventEmitter<void>();
}
