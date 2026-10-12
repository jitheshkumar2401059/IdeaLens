import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project } from '../../../core/models/project.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BadgeComponent, EmptyStateComponent],
  template: `
    <div class="projects-page-container">
      <!-- Header Bar -->
      <div class="projects-header">
        <div>
          <h2>Explore Project Ideas</h2>
          <p>Browse, inspect, and analyze academic software and capstone engineering proposals</p>
        </div>

        <a *ngIf="authService.isStudent()" routerLink="/projects/new" class="btn btn-primary">
          <span>+</span>
          <span>Propose Idea</span>
        </a>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="toolbar glass-panel">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Search projects by title, problem, or technology..."
          />
        </div>

        <div class="filters-row">
          <!-- Mine vs All Toggle -->
          <div class="filter-group" *ngIf="authService.isStudent()">
            <select [(ngModel)]="mineFilter" (change)="loadProjects()">
              <option [ngValue]="false">All Campus Projects</option>
              <option [ngValue]="true">Only My Projects</option>
            </select>
          </div>

          <!-- Domain Filter -->
          <div class="filter-group">
            <select [(ngModel)]="selectedDomain" (change)="loadProjects()">
              <option value="">All Domains</option>
              <option *ngFor="let d of domains" [value]="d">{{ d }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="filter-group">
            <select [(ngModel)]="selectedStatus" (change)="loadProjects()">
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="revision_requested">Revision Requested</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="filter-group">
            <select [(ngModel)]="selectedSort" (change)="loadProjects()">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="projects-grid" *ngIf="!isLoading && projects.length > 0">
        <div class="project-card glass-card" *ngFor="let proj of projects">
          <div class="card-top">
            <span class="domain-badge">{{ proj.domain }}</span>
            <app-badge [status]="proj.status"></app-badge>
          </div>

          <h3 class="card-title">
            <a [routerLink]="['/projects', proj._id]">{{ proj.title }}</a>
          </h3>

          <p class="card-problem">
            {{ truncateText(proj.problemStatement, 140) }}
          </p>

          <div class="tech-stack-row">
            <span class="tag-pill" *ngFor="let tech of (proj.technologies || []).slice(0, 4)">
              {{ tech }}
            </span>
            <span class="tag-more" *ngIf="(proj.technologies || []).length > 4">
              +{{ (proj.technologies || []).length - 4 }} more
            </span>
          </div>

          <div class="card-footer">
            <div class="author-meta">
              <span class="author-name">{{ getStudentName(proj.studentId) }}</span>
              <span class="version-tag">Version {{ proj.currentVersion }}</span>
            </div>

            <div class="card-actions">
              <a [routerLink]="['/projects', proj._id]" class="btn btn-secondary btn-sm">
                Inspect Details →
              </a>
              <button
                *ngIf="canManage(proj)"
                class="btn-delete-icon"
                (click)="deleteProject(proj._id)"
                title="Delete Project"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <span class="animate-spin text-2xl">⏳</span>
        <span>Loading project ideas from MongoDB...</span>
      </div>

      <!-- Error State -->
      <div class="error-state glass-card" *ngIf="!isLoading && errorMessage">
        <span class="error-icon">⚠️</span>
        <h3>Failed to Load Projects</h3>
        <p>{{ errorMessage }}</p>
        <button class="btn btn-primary btn-sm" (click)="loadProjects()">
          🔄 Try Again
        </button>
      </div>

      <!-- Empty State -->
      <app-empty-state
        *ngIf="!isLoading && !errorMessage && projects.length === 0"
        icon="📁"
        title="No Project Ideas Found"
        description="Try adjusting your search criteria or domain filters, or create a brand new idea!"
        [actionLabel]="authService.isStudent() ? '+ Create New Project Idea' : ''"
        (actionClicked)="createNewProject()"
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .projects-page-container {
      padding: 32px 24px;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .projects-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .projects-header h2 {
      font-size: 1.75rem;
      margin-bottom: 4px;
    }

    .toolbar {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .search-input-wrap {
      position: relative;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-input-wrap input {
      padding-left: 42px;
      background: rgba(15, 23, 42, 0.6);
    }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .filter-group {
      flex: 1;
      min-width: 160px;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .project-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .domain-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-cyan);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .card-title {
      font-size: 1.15rem;
      margin-bottom: 8px;
      line-height: 1.35;
    }

    .card-title a {
      color: var(--text-main);
    }

    .card-title a:hover {
      color: var(--primary-400);
    }

    .card-problem {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 16px;
      line-height: 1.45;
    }

    .tech-stack-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 20px;
    }

    .tag-more {
      font-size: 0.7rem;
      color: var(--text-muted);
      align-self: center;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
    }

    .author-meta {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .version-tag {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }

    .btn-delete-icon {
      padding: 6px;
      border-radius: var(--radius-sm);
      opacity: 0.7;
      transition: all 0.2s;
    }

    .btn-delete-icon:hover {
      opacity: 1;
      background: rgba(244, 63, 94, 0.15);
    }

    .loading-state {
      padding: 64px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
    }

    .error-state {
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      max-width: 500px;
      margin: 40px auto;
      border: 1px solid rgba(244, 63, 94, 0.3);
      background: rgba(244, 63, 94, 0.05);
    }

    .error-icon {
      font-size: 2.5rem;
    }

    .error-state h3 {
      font-size: 1.25rem;
      color: var(--accent-rose);
    }

    .error-state p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  searchQuery = '';
  selectedDomain = '';
  selectedStatus = '';
  selectedSort = 'newest';
  mineFilter = false;

  domains = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Web Development',
    'IoT',
    'Cybersecurity',
    'Healthcare',
    'Education',
    'Smart City',
    'Environment',
    'FinTech',
    'Agriculture'
  ];

  constructor(
    private projectService: ProjectService,
    public authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.errorMessage = null;
    this.projectService.getProjects({
      search: this.searchQuery ? this.searchQuery.trim() : undefined,
      domain: this.selectedDomain || undefined,
      status: this.selectedStatus || undefined,
      sort: this.selectedSort || undefined,
      mine: this.mineFilter
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (res) => {
        this.projects = res?.data || [];
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load projects from server. Please try again.';
        this.toast.error('Failed to load projects');
      }
    });
  }

  onSearchChange() {
    this.loadProjects();
  }

  truncateText(text: string, maxLen = 140): string {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }

  getStudentName(student: any): string {
    if (!student) return 'Student';
    if (typeof student === 'object') return student.name || 'Student';
    return 'Student';
  }

  canManage(project: Project): boolean {
    if (this.authService.isAdmin()) return true;
    const currentUserId = this.authService.currentUser()?.id || (this.authService.currentUser() as any)?._id;
    const studentId = typeof project.studentId === 'object' ? (project.studentId as any)._id : project.studentId;
    return currentUserId === studentId;
  }

  deleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project idea?')) return;
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.toast.success('Project idea deleted');
        this.projects = this.projects.filter(p => p._id !== id);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to delete project');
      }
    });
  }

  createNewProject() {
    this.router.navigate(['/projects/new']);
  }
}
