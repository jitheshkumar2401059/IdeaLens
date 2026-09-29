import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { ReviewService } from '../../core/services/review.service';
import { Project } from '../../core/models/project.model';
import { Review } from '../../core/models/review.model';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-faculty-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BadgeComponent],
  template: `
    <div class="reviews-page-container">
      <div class="reviews-header glass-card">
        <div class="header-content">
          <div class="header-badge">
            <span>⚖️</span>
            <span>Academic Committee Portal</span>
          </div>
          <h2>Faculty Evaluation & Review Workspace</h2>
          <p>
            Assess student project ideas, inspect Gemini AI critique, check similarity scores, and submit official department decisions.
          </p>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="toolbar glass-panel">
        <div class="tabs-filter">
          <button
            class="filter-pill"
            [class.active]="filterStatus === 'all'"
            (click)="setFilter('all')"
          >
            All Submissions ({{ allProjects.length }})
          </button>
          <button
            class="filter-pill"
            [class.active]="filterStatus === 'pending'"
            (click)="setFilter('pending')"
          >
            Pending Review ({{ getCount('pending') }})
          </button>
          <button
            class="filter-pill"
            [class.active]="filterStatus === 'approved'"
            (click)="setFilter('approved')"
          >
            Approved ({{ getCount('approved') }})
          </button>
          <button
            class="filter-pill"
            [class.active]="filterStatus === 'revision_requested'"
            (click)="setFilter('revision_requested')"
          >
            Revision Requested ({{ getCount('revision_requested') }})
          </button>
        </div>
      </div>

      <!-- Submissions Table -->
      <div class="glass-card table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Project Idea</th>
                <th>Student</th>
                <th>Domain</th>
                <th>Status</th>
                <th>Version</th>
                <th>Date Submitted</th>
                <th>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let proj of filteredProjects">
                <td class="cell-title">
                  <a [routerLink]="['/projects', proj._id]" class="proj-link">
                    {{ proj.title }}
                  </a>
                </td>
                <td>{{ getStudentName(proj.studentId) }}</td>
                <td><span class="tag-pill">{{ proj.domain }}</span></td>
                <td><app-badge [status]="proj.status"></app-badge></td>
                <td>v{{ proj.currentVersion }}</td>
                <td>{{ proj.createdAt | date:'mediumDate' }}</td>
                <td>
                  <a [routerLink]="['/projects', proj._id]" [queryParams]="{ tab: 'reviews' }" class="btn btn-primary btn-sm">
                    Evaluate & Review
                  </a>
                </td>
              </tr>
              <tr *ngIf="filteredProjects.length === 0">
                <td colspan="7" class="text-center py-6 text-muted">
                  No submissions matching this filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-page-container {
      padding: 32px 24px;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .reviews-header {
      padding: 32px;
      border: 1px solid var(--border-subtle);
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.25);
      color: var(--accent-amber);
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .reviews-header h2 {
      font-size: 1.85rem;
      margin-bottom: 6px;
    }

    .toolbar {
      padding: 12px 18px;
    }

    .tabs-filter {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-pill {
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s;
    }

    .filter-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
    }

    .filter-pill.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--primary-500);
      color: var(--primary-100);
    }

    .table-card {
      padding: 24px;
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

    .proj-link {
      font-weight: 600;
      color: var(--text-main);
    }

    .proj-link:hover {
      color: var(--primary-400);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
  `]
})
export class FacultyReviewsComponent implements OnInit {
  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  filterStatus = 'all';

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: (res: any) => {
        this.allProjects = res.data;
        this.applyFilter();
      }
    });
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterStatus === 'all') {
      this.filteredProjects = this.allProjects;
    } else if (this.filterStatus === 'pending') {
      this.filteredProjects = this.allProjects.filter(
        p => p.status === 'submitted' || p.status === 'resubmitted' || p.status === 'under_review'
      );
    } else {
      this.filteredProjects = this.allProjects.filter(p => p.status === this.filterStatus);
    }
  }

  getCount(status: string): number {
    if (status === 'pending') {
      return this.allProjects.filter(
        p => p.status === 'submitted' || p.status === 'resubmitted' || p.status === 'under_review'
      ).length;
    }
    return this.allProjects.filter(p => p.status === status).length;
  }

  getStudentName(student: any): string {
    if (!student) return 'Student';
    if (typeof student === 'object') return student.name || 'Student';
    return 'Student';
  }
}
