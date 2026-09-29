import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { PlatformStats } from '../../../core/models/stats.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatCardComponent],
  template: `
    <div class="admin-page-container">
      <div class="admin-header glass-card">
        <div class="header-badge">
          <span>🛡️</span>
          <span>College Super-Administrator</span>
        </div>
        <h2>System Administration & Governance</h2>
        <p>Monitor platform usage, manage user access permissions, and oversee institutional innovation metrics.</p>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid-cols-4 stats-grid" *ngIf="stats">
        <app-stat-card
          title="Total Users"
          [value]="stats.users.total"
          [subtitle]="stats.users.students + ' Students | ' + stats.users.faculty + ' Faculty'"
          accentColor="var(--accent-cyan)"
        >
          <span icon>👥</span>
        </app-stat-card>

        <app-stat-card
          title="Total Projects"
          [value]="stats.projects.total"
          [subtitle]="stats.projects.totalAnalyzed + ' Analyzed with AI'"
          accentColor="var(--primary-500)"
        >
          <span icon>💡</span>
        </app-stat-card>

        <app-stat-card
          title="Approved Capstones"
          [value]="stats.projects.approved"
          subtitle="Cleared faculty review"
          accentColor="var(--accent-emerald)"
        >
          <span icon>✅</span>
        </app-stat-card>

        <app-stat-card
          title="In Review Queue"
          [value]="stats.projects.submitted + stats.projects.underReview"
          subtitle="Pending faculty action"
          accentColor="var(--accent-amber)"
        >
          <span icon>⏳</span>
        </app-stat-card>
      </div>

      <!-- User Management Section -->
      <div class="glass-card table-section">
        <div class="table-section-header">
          <div>
            <h3>User Management</h3>
            <span class="subtext">View registered campus accounts and toggle active access</span>
          </div>

          <div class="user-filters">
            <input
              type="text"
              [(ngModel)]="searchUser"
              (input)="loadUsers()"
              placeholder="Search user by name or email..."
            />
            <select [(ngModel)]="selectedRole" (change)="loadUsers()">
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="table-responsive mt-3">
          <table class="data-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Department</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="user-name-cell">
                  <strong>{{ u.name }}</strong>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="role-badge" [ngClass]="'role-' + u.role">
                    {{ u.role | uppercase }}
                  </span>
                </td>
                <td>{{ u.department || 'N/A' }}</td>
                <td>
                  <span class="status-indicator" [class.active]="u.isActive" [class.inactive]="!u.isActive">
                    ● {{ u.isActive ? 'Active' : 'Deactivated' }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm"
                    [ngClass]="u.isActive ? 'btn-danger' : 'btn-success'"
                    (click)="toggleUser(u)"
                  >
                    {{ u.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page-container {
      padding: 32px 24px;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .admin-header {
      padding: 32px;
      border: 1px solid var(--border-subtle);
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.25);
      color: var(--accent-rose);
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .admin-header h2 {
      font-size: 1.85rem;
      margin-bottom: 6px;
    }

    .stats-grid {
      margin-bottom: 8px;
    }

    .table-section {
      padding: 24px;
    }

    .table-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .subtext {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .user-filters {
      display: flex;
      gap: 12px;
    }

    .user-filters input {
      min-width: 240px;
      background: rgba(15, 23, 42, 0.6);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    .data-table th {
      padding: 12px 16px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-subtle);
    }

    .data-table td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-secondary);
    }

    .user-name-cell {
      color: var(--text-main);
    }

    .role-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .role-student { background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); }
    .role-faculty { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
    .role-admin { background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); }

    .status-indicator {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-indicator.active { color: var(--accent-emerald); }
    .status-indicator.inactive { color: var(--accent-rose); }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.75rem;
    }

    .mt-3 { margin-top: 14px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  stats: PlatformStats | null = null;

  searchUser = '';
  selectedRole = '';

  constructor(
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
  }

  loadStats() {
    this.adminService.getPlatformStats().subscribe({
      next: (res) => {
        this.stats = res.data;
      }
    });
  }

  loadUsers() {
    this.adminService.getUsers({
      search: this.searchUser || undefined,
      role: this.selectedRole || undefined
    }).subscribe({
      next: (res) => {
        this.users = res.data;
      }
    });
  }

  toggleUser(u: User) {
    const id = u.id || (u as any)._id;
    this.adminService.toggleUserStatus(id).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        u.isActive = res.data.isActive;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Action failed');
      }
    });
  }
}
