import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-wrapper glass-panel" [class.open]="isOpen">
      <div class="sidebar-content">
        <div class="nav-section">
          <div class="section-label">MAIN NAVIGATION</div>

          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeOnMobile()" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </a>

          <a routerLink="/projects" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active" (click)="closeOnMobile()" class="nav-item">
            <span class="nav-icon">📁</span>
            <span class="nav-label">Explore Projects</span>
          </a>

          <a *ngIf="authService.isStudent()" routerLink="/projects/new" routerLinkActive="active" (click)="closeOnMobile()" class="nav-item highlight-item">
            <span class="nav-icon">✨</span>
            <span class="nav-label">New Project Idea</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="section-label">AI & NOVELTY ENGINE</div>

          <a routerLink="/similar-projects" routerLinkActive="active" (click)="closeOnMobile()" class="nav-item">
            <span class="nav-icon">🔍</span>
            <span class="nav-label">Similarity Explorer</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isFaculty() || authService.isAdmin()">
          <div class="section-label">ACADEMIC EVALUATION</div>

          <a routerLink="/reviews" routerLinkActive="active" (click)="closeOnMobile()" class="nav-item">
            <span class="nav-icon">📝</span>
            <span class="nav-label">Faculty Reviews</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isAdmin()">
          <div class="section-label">SYSTEM ADMINISTRATION</div>

          <a routerLink="/admin" routerLinkActive="active" (click)="closeOnMobile()" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Admin Management</span>
          </a>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="ai-status-pill">
          <span class="pulse-dot"></span>
          <span>Gemini 1.5 & Vector Match Ready</span>
        </div>
      </div>
    </aside>

    <div class="sidebar-overlay" *ngIf="isOpen" (click)="close.emit()"></div>
  `,
  styles: [`
    .sidebar-wrapper {
      width: var(--sidebar-width);
      height: calc(100vh - var(--navbar-height));
      position: sticky;
      top: var(--navbar-height);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 0;
      border-left: none;
      border-top: none;
      border-bottom: none;
      transition: transform 0.3s ease;
      background: rgba(10, 14, 23, 0.95);
      z-index: 990;
    }

    .sidebar-content {
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      overflow-y: auto;
    }

    .section-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 8px;
      padding-left: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
    }

    .nav-item.active {
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary-100);
      border-left: 3px solid var(--primary-500);
      font-weight: 600;
    }

    .highlight-item {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      border: 1px dashed rgba(99, 102, 241, 0.4);
      color: var(--primary-400);
    }

    .highlight-item:hover {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
      color: #ffffff;
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    .ai-status-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--accent-emerald);
      font-size: 0.725rem;
      font-weight: 600;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-emerald);
      box-shadow: 0 0 8px var(--accent-emerald);
    }

    @media (max-width: 900px) {
      .sidebar-wrapper {
        position: fixed;
        left: 0;
        top: var(--navbar-height);
        height: calc(100vh - var(--navbar-height));
        transform: translateX(-100%);
      }

      .sidebar-wrapper.open {
        transform: translateX(0);
      }

      .sidebar-overlay {
        position: fixed;
        top: var(--navbar-height);
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 980;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  closeOnMobile() {
    this.close.emit();
  }
}
