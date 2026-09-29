import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card glass-card" [style.border-top]="'3px solid ' + accentColor">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-icon-wrap" [style.background]="accentBg" [style.color]="accentColor">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-footer" *ngIf="subtitle">
        <span class="stat-subtitle">{{ subtitle }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stat-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .stat-value {
      font-size: 2.1rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--text-main);
      line-height: 1.1;
    }
    .stat-footer {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  `]
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = 0;
  @Input() subtitle: string = '';
  @Input() accentColor: string = 'var(--primary-500)';
  @Input() accentBg: string = 'rgba(99, 102, 241, 0.15)';
}
