import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="'badge-' + status">
      <span class="dot" [ngClass]="'dot-' + status"></span>
      {{ formatStatus(status) }}
    </span>
  `,
  styles: [`
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-draft { background-color: var(--status-draft); }
    .dot-submitted { background-color: var(--status-submitted); }
    .dot-under_review { background-color: var(--status-under-review); }
    .dot-approved { background-color: var(--status-approved); }
    .dot-revision_requested { background-color: var(--status-revision); }
    .dot-rejected { background-color: var(--status-rejected); }
    .dot-resubmitted { background-color: var(--accent-purple); }
  `]
})
export class BadgeComponent {
  @Input() status: string = 'draft';

  formatStatus(status: string): string {
    if (!status) return 'DRAFT';
    return status.replace(/_/g, ' ').toUpperCase();
  }
}
