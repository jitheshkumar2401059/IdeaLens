import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { AdminService } from '../../core/services/admin.service';
import { Project } from '../../core/models/project.model';
import { PlatformStats } from '../../core/models/stats.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, BadgeComponent],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Header -->
      <div class="dashboard-header glass-card">
        <div class="header-text">
          <div class="header-badge">
            <span class="pulse-dot"></span>
            <span>Academic Idea Lifecycle Management</span>
          </div>
          <h1>Welcome, <span class="gradient-text">{{ authService.currentUser()?.name }}</span></h1>
          <p>
            {{ getRoleSubtext() }}
          </p>
        </div>

        <div class="header-actions">
          <a
            *ngIf="authService.isStudent()"
            routerLink="/projects/new"
            class="btn btn-primary"
          >
            <span>+</span>
            <span>Create New Idea</span>
          </a>
          <a
            routerLink="/similar-projects"
            class="btn btn-secondary"
          >
            <span>🔍</span>
            <span>Similarity Explorer</span>
          </a>
        </div>
      </div>

      <!-- STUDENT DASHBOARD VIEW -->
      <div *ngIf="authService.isStudent()">
        <!-- Student KPI Cards -->
        <div class="grid-cols-4 stats-grid">
          <app-stat-card
            title="Total Projects"
            [value]="studentProjects.length"
            subtitle="Registered in your workspace"
            accentColor="var(--primary-500)"
          >
            <span icon>📁</span>
          </app-stat-card>

          <app-stat-card
            title="Draft Projects"
            [value]="countStatus('draft')"
            subtitle="Awaiting final submission"
            accentColor="var(--status-draft)"
          >
            <span icon>✏️</span>
          </app-stat-card>

          <app-stat-card
            title="Submitted & Review"
            [value]="countStatus('submitted') + countStatus('under_review')"
            subtitle="Under faculty review"
            accentColor="var(--status-under-review)"
          >
            <span icon>⏳</span>
          </app-stat-card>

          <app-stat-card
            title="Approved Ideas"
            [value]="countStatus('approved')"
            subtitle="Successfully cleared capstone review"
            accentColor="var(--status-approved)"
          >
            <span icon>🎉</span>
          </app-stat-card>
        </div>

        <!-- Student Charts & Analytics Section -->
        <div class="analytics-grid">
          <!-- Status Distribution Bar Chart -->
          <div class="glass-card chart-card">
            <div class="chart-header">
              <h3>Idea Pipeline Distribution</h3>
              <span class="chart-sub">Real-time status breakdown</span>
            </div>

            <div class="chart-bars">
              <div class="bar-group" *ngFor="let item of statusDistribution">
                <div class="bar-label-top">
                  <span class="name">{{ item.name }}</span>
                  <span class="count">{{ item.count }}</span>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.width.%]="item.percentage"
                    [style.background]="item.color"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Domain Coverage Breakdown -->
          <div class="glass-card chart-card">
            <div class="chart-header">
              <h3>My Domain Specializations</h3>
              <span class="chart-sub">Coverage across computing verticals</span>
            </div>

            <div class="domains-list">
              <div class="domain-item" *ngFor="let d of studentDomains">
                <div class="domain-info">
                  <span class="domain-tag">{{ d.domain }}</span>
                  <span class="domain-count">{{ d.count }} Project{{ d.count > 1 ? 's' : '' }}</span>
                </div>
                <div class="domain-progress-track">
                  <div
                    class="domain-progress-fill"
                    [style.width.%]="(d.count / (studentProjects.length || 1)) * 100"
                  ></div>
                </div>
              </div>
              <div class="notif-empty" *ngIf="studentDomains.length === 0">
                Create a project to visualize your domain portfolio.
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects Table -->
        <div class="glass-card section-card">
          <div class="section-card-header">
            <div>
              <h3>Recent Project Ideas</h3>
              <span class="chart-sub">Manage and trigger AI analyses</span>
            </div>
            <a routerLink="/projects" class="view-all-link">View All Projects →</a>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Project Title</th>
                  <th>Domain</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Last Analyzed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let proj of studentProjects.slice(0, 5)">
                  <td class="cell-title">
                    <a [routerLink]="['/projects', proj._id]" class="proj-title-link">
                      {{ proj.title }}
                    </a>
                  </td>
                  <td><span class="tag-pill">{{ proj.domain }}</span></td>
                  <td>v{{ proj.currentVersion }}</td>
                  <td><app-badge [status]="proj.status"></app-badge></td>
                  <td>
                    <span *ngIf="proj.lastAnalyzedAt">{{ proj.lastAnalyzedAt | date:'mediumDate' }}</span>
                    <span *ngIf="!proj.lastAnalyzedAt" class="text-muted">Not yet analyzed</span>
                  </td>
                  <td>
                    <a [routerLink]="['/projects', proj._id]" class="btn btn-secondary btn-sm">
                      Inspect →
                    </a>
                  </td>
                </tr>
                <tr *ngIf="studentProjects.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No project ideas created yet. Click "+ Create New Idea" above to get started!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- FACULTY DASHBOARD VIEW -->
      <div *ngIf="authService.isFaculty()">
        <div class="grid-cols-4 stats-grid">
          <app-stat-card
            title="Total Submissions"
            [value]="facultySubmissions.length"
            subtitle="Projects across college departments"
            accentColor="var(--primary-400)"
          >
            <span icon>📋</span>
          </app-stat-card>

          <app-stat-card
            title="Pending Review"
            [value]="countFacultyStatus('submitted') + countFacultyStatus('resubmitted')"
            subtitle="Awaiting your faculty evaluation"
            accentColor="var(--accent-amber)"
          >
            <span icon>⏳</span>
          </app-stat-card>

          <app-stat-card
            title="Approved Ideas"
            [value]="countFacultyStatus('approved')"
            subtitle="Cleared capstone standards"
            accentColor="var(--accent-emerald)"
          >
            <span icon>✅</span>
          </app-stat-card>

          <app-stat-card
            title="Revisions Requested"
            [value]="countFacultyStatus('revision_requested')"
            subtitle="Sent back for student iteration"
            accentColor="var(--accent-rose)"
          >
            <span icon>🔄</span>
          </app-stat-card>
        </div>

        <div class="glass-card section-card">
          <div class="section-card-header">
            <div>
              <h3>Pending Submissions Queue</h3>
              <span class="chart-sub">Ideas awaiting academic rubric evaluation</span>
            </div>
            <a routerLink="/reviews" class="view-all-link">Review Workspace →</a>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Project Title</th>
                  <th>Student Innovator</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of getPendingFacultyQueue().slice(0, 6)">
                  <td class="cell-title">
                    <a [routerLink]="['/projects', p._id]" class="proj-title-link">{{ p.title }}</a>
                  </td>
                  <td>{{ getStudentName(p.studentId) }}</td>
                  <td><span class="tag-pill">{{ p.domain }}</span></td>
                  <td><app-badge [status]="p.status"></app-badge></td>
                  <td>v{{ p.currentVersion }}</td>
                  <td>
                    <a [routerLink]="['/projects', p._id]" class="btn btn-primary btn-sm">
                      Evaluate & Review
                    </a>
                  </td>
                </tr>
                <tr *ngIf="getPendingFacultyQueue().length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No pending submissions right now. All submissions reviewed!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ADMIN DASHBOARD VIEW -->
      <div *ngIf="authService.isAdmin()">
        <div class="grid-cols-4 stats-grid" *ngIf="platformStats">
          <app-stat-card
            title="Total Users"
            [value]="platformStats.users.total"
            [subtitle]="platformStats.users.students + ' Students, ' + platformStats.users.faculty + ' Faculty'"
            accentColor="var(--accent-cyan)"
          >
            <span icon>👥</span>
          </app-stat-card>

          <app-stat-card
            title="Total Projects"
            [value]="platformStats.projects.total"
            [subtitle]="platformStats.projects.totalAnalyzed + ' Analyzed with AI'"
            accentColor="var(--primary-500)"
          >
            <span icon>💡</span>
          </app-stat-card>

          <app-stat-card
            title="Approved Ideas"
            [value]="platformStats.projects.approved"
            subtitle="Accredited academic projects"
            accentColor="var(--accent-emerald)"
          >
            <span icon>🏆</span>
          </app-stat-card>

          <app-stat-card
            title="Under Review"
            [value]="platformStats.projects.underReview + platformStats.projects.submitted"
            subtitle="In faculty evaluation workflow"
            accentColor="var(--accent-amber)"
          >
            <span icon>⚙️</span>
          </app-stat-card>
        </div>

        <!-- Admin Domain Breakdown & Recent Activity -->
        <div class="analytics-grid" *ngIf="platformStats">
          <div class="glass-card chart-card">
            <div class="chart-header">
              <h3>Projects by Domain</h3>
              <span class="chart-sub">Departmental project concentrations</span>
            </div>
            <div class="domains-list">
              <div class="domain-item" *ngFor="let item of platformStats.domainBreakdown">
                <div class="domain-info">
                  <span class="domain-tag">{{ item.domain }}</span>
                  <span class="domain-count">{{ item.count }}</span>
                </div>
                <div class="domain-progress-track">
                  <div
                    class="domain-progress-fill"
                    [style.width.%]="(item.count / (platformStats.projects.total || 1)) * 100"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card chart-card">
            <div class="chart-header">
              <h3>Latest Platform Activity</h3>
              <span class="chart-sub">Recent reviews and evaluations</span>
            </div>
            <div class="activity-feed">
              <div class="activity-item" *ngFor="let rev of platformStats.recentActivity.reviews">
                <div class="activity-dot"></div>
                <div class="activity-details">
                  <span class="act-proj">{{ rev.projectId?.title || 'Project' }}</span>
                  <span class="act-faculty">Reviewed by {{ rev.facultyId?.name || 'Faculty' }}</span>
                  <span class="act-badge"><app-badge [status]="rev.statusDecision"></app-badge></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px;
      border: 1px solid var(--border-subtle);
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: var(--primary-400);
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary-400);
      box-shadow: 0 0 8px var(--primary-400);
    }

    .dashboard-header h1 {
      font-size: 1.85rem;
      margin-bottom: 6px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    @media (max-width: 800px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }
    }

    .stats-grid {
      margin-bottom: 28px;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }

    @media (max-width: 900px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .chart-header h3 {
      font-size: 1.1rem;
    }

    .chart-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .chart-bars {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bar-label-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.825rem;
      font-weight: 500;
    }

    .bar-track {
      height: 8px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
    }

    .domains-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .domain-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .domain-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.825rem;
    }

    .domain-tag {
      font-weight: 600;
      color: var(--text-main);
    }

    .domain-count {
      color: var(--text-muted);
    }

    .domain-progress-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 3px;
      overflow: hidden;
    }

    .domain-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #06b6d4);
      border-radius: 3px;
    }

    .section-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .view-all-link {
      font-size: 0.85rem;
      font-weight: 600;
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

    .cell-title {
      max-width: 320px;
    }

    .proj-title-link {
      font-weight: 600;
      color: var(--text-main);
    }

    .proj-title-link:hover {
      color: var(--primary-400);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }

    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.02);
    }

    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-cyan);
      margin-top: 6px;
    }

    .activity-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .act-proj {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-main);
    }

    .act-faculty {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .act-badge {
      margin-top: 2px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  studentProjects: Project[] = [];
  facultySubmissions: Project[] = [];
  platformStats: PlatformStats | null = null;

  statusDistribution: { name: string; count: number; percentage: number; color: string }[] = [];
  studentDomains: { domain: string; count: number }[] = [];

  constructor(
    public authService: AuthService,
    private projectService: ProjectService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    if (this.authService.isStudent()) {
      this.loadStudentDashboard();
    } else if (this.authService.isFaculty()) {
      this.loadFacultyDashboard();
    } else if (this.authService.isAdmin()) {
      this.loadAdminDashboard();
    }
  }

  getRoleSubtext(): string {
    const role = this.authService.userRole();
    if (role === 'student') return 'Submit project ideas, run AI novelty comparisons, track versions, and receive faculty feedback.';
    if (role === 'faculty') return 'Review submitted capstone proposals, inspect AI analyses and similarity matrices, and submit rubric evaluations.';
    return 'System overview, user administration, domain taxonomy, and platform activity metrics.';
  }

  loadStudentDashboard() {
    this.projectService.getProjects({ mine: true }).subscribe({
      next: (res) => {
        this.studentProjects = res.data;
        this.computeStudentAnalytics();
      }
    });
  }

  computeStudentAnalytics() {
    const total = this.studentProjects.length || 1;
    const statuses = [
      { name: 'Draft', key: 'draft', color: 'var(--status-draft)' },
      { name: 'Submitted / Review', key: 'submitted', color: 'var(--status-under-review)' },
      { name: 'Approved', key: 'approved', color: 'var(--status-approved)' },
      { name: 'Revision Requested', key: 'revision_requested', color: 'var(--status-revision)' }
    ];

    this.statusDistribution = statuses.map(s => {
      let count = 0;
      if (s.key === 'submitted') {
        count = this.studentProjects.filter(p => p.status === 'submitted' || p.status === 'under_review' || p.status === 'resubmitted').length;
      } else {
        count = this.studentProjects.filter(p => p.status === s.key).length;
      }
      return {
        name: s.name,
        count,
        percentage: Math.round((count / total) * 100),
        color: s.color
      };
    });

    const domainMap: { [key: string]: number } = {};
    for (const p of this.studentProjects) {
      domainMap[p.domain] = (domainMap[p.domain] || 0) + 1;
    }
    this.studentDomains = Object.entries(domainMap).map(([domain, count]) => ({ domain, count }));
  }

  countStatus(status: string): number {
    return this.studentProjects.filter(p => p.status === status).length;
  }

  loadFacultyDashboard() {
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.facultySubmissions = res.data;
      }
    });
  }

  countFacultyStatus(status: string): number {
    return this.facultySubmissions.filter(p => p.status === status).length;
  }

  getPendingFacultyQueue(): Project[] {
    return this.facultySubmissions.filter(
      p => p.status === 'submitted' || p.status === 'resubmitted' || p.status === 'under_review'
    );
  }

  getStudentName(student: any): string {
    if (!student) return 'Student';
    if (typeof student === 'object') return student.name || 'Student';
    return 'Student';
  }

  loadAdminDashboard() {
    this.adminService.getPlatformStats().subscribe({
      next: (res) => {
        this.platformStats = res.data;
      }
    });
  }
}
