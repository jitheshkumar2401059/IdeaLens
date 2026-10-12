import { Component, OnInit, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, NotificationItem } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-wrapper glass-panel">
      <div class="nav-left">
        <button class="menu-toggle-btn" (click)="toggleSidebar.emit()" aria-label="Toggle Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <a routerLink="/dashboard" class="brand-link">
          <div class="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Idea<span class="gradient-text">Lens</span></span>
            <span class="brand-tag">AI Academic ALM</span>
          </div>
        </a>
      </div>

      <div class="nav-right" *ngIf="authService.isAuthenticated()">
        <!-- Notification Dropdown -->
        <div class="notification-wrapper">
          <button class="nav-icon-btn" (click)="toggleNotifications()" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notification-badge" *ngIf="notificationService.unreadCount() > 0">
              {{ notificationService.unreadCount() }}
            </span>
          </button>

          <!-- Notification Menu -->
          <div class="notification-menu glass-panel" *ngIf="showNotifications">
            <div class="notification-header">
              <span>Notifications</span>
              <button class="mark-all-btn" (click)="markAllRead()">Mark all read</button>
            </div>
            <div class="notification-list">
              <div
                *ngFor="let n of notificationService.notifications()"
                class="notification-item"
                [class.unread]="!n.isRead"
                (click)="onNotificationClick(n)"
              >
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ n.createdAt | date:'shortTime' }}</div>
              </div>
              <div class="notif-empty" *ngIf="notificationService.notifications().length === 0">
                No notifications right now
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile Pill -->
        <div class="user-pill">
          <div class="avatar-circle">
            {{ getInitials(authService.currentUser()?.name) }}
          </div>
          <div class="user-meta">
            <span class="user-name">{{ authService.currentUser()?.name }}</span>
            <span class="role-badge" [ngClass]="'role-' + authService.userRole()">
              {{ authService.userRole() | uppercase }}
            </span>
          </div>
        </div>

        <button class="btn btn-secondary logout-btn" (click)="authService.logout()" title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span class="logout-text">Logout</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      height: var(--navbar-height);
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-toggle-btn {
      display: none;
      color: var(--text-main);
      padding: 6px;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 900px) {
      .menu-toggle-btn {
        display: block;
      }
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    }

    .brand-title {
      font-size: 1.3rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
    }

    .gradient-text {
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-tag {
      display: block;
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: -3px;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .notification-wrapper {
      position: relative;
    }

    .nav-icon-btn {
      position: relative;
      color: var(--text-secondary);
      padding: 8px;
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }

    .nav-icon-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.06);
    }

    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--accent-rose);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: bold;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-primary);
    }

    .notification-menu {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 320px;
      max-height: 400px;
      overflow-y: auto;
      padding: 12px;
      z-index: 1001;
      border: 1px solid var(--border-strong);
      box-shadow: var(--shadow-lg);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-subtle);
      font-weight: 600;
      font-size: 0.85rem;
    }

    .mark-all-btn {
      font-size: 0.75rem;
      color: var(--primary-400);
    }

    .notification-item {
      padding: 10px;
      border-radius: var(--radius-sm);
      margin-top: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .notification-item.unread {
      background: rgba(99, 102, 241, 0.1);
      border-left: 3px solid var(--primary-500);
    }

    .notif-title {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .notif-msg {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .notif-time {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .notif-empty {
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: 9999px;
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.2;
    }

    .role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .role-student { color: var(--accent-cyan); }
    .role-faculty { color: var(--accent-amber); }
    .role-admin { color: var(--accent-rose); }

    .logout-btn {
      padding: 8px 14px;
      font-size: 0.85rem;
    }

    @media (max-width: 640px) {
      .user-meta, .logout-text {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  showNotifications = false;

  constructor(
    public authService: AuthService,
    public notificationService: NotificationService
  ) {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.notificationService.fetchNotifications().subscribe({
          error: () => {}
        });
      }
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.notificationService.fetchNotifications().subscribe({
        error: () => {}
      });
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.fetchNotifications().subscribe();
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  onNotificationClick(notif: NotificationItem) {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif._id).subscribe();
    }
    this.showNotifications = false;
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
