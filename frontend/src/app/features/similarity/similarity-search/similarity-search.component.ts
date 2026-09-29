import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SimilarityService } from '../../../core/services/similarity.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-similarity-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BadgeComponent],
  template: `
    <div class="similarity-explorer-container">
      <div class="explorer-header glass-card">
        <div class="header-content">
          <div class="header-badge">
            <span>🧬</span>
            <span>Algorithmic Overlap & Differentiation Engine</span>
          </div>
          <h2>Similar Project Search & Novelty Explorer</h2>
          <p>
            Compare idea concepts against institutional repository projects using TF-IDF term vectors, technology Jaccard overlap, and domain matching.
          </p>
        </div>
      </div>

      <!-- Legal Novelty Notice -->
      <div class="disclaimer-banner glass-panel">
        <div class="disclaimer-icon">⚖️</div>
        <div class="disclaimer-text">
          <strong>Academic Novelty Disclaimer:</strong>
          This tool provides educational similarity and differentiation analysis against existing student ideas in this repository. It does not constitute a formal patent search or legal determination of intellectual property novelty.
        </div>
      </div>

      <!-- Interactive Instant Idea Checker Sandbox -->
      <div class="sandbox-card glass-card">
        <div class="sandbox-header">
          <div>
            <h3>Interactive Idea Similarity Checker</h3>
            <span class="sandbox-sub">Paste an idea or problem draft below to test overlap against existing repository projects</span>
          </div>
          <button class="btn btn-primary btn-sm" (click)="runInstantTest()" [disabled]="!testText">
            🔍 Check Similarity
          </button>
        </div>

        <div class="sandbox-body mt-3">
          <textarea
            rows="3"
            [(ngModel)]="testText"
            placeholder="e.g. Smart trash bin using ultrasonic sensors and route optimization for garbage trucks in city neighborhoods..."
          ></textarea>
        </div>

        <!-- Instant Test Results -->
        <div class="instant-results mt-4" *ngIf="instantMatches.length > 0">
          <h4>Comparison Matches (Top {{ instantMatches.length }}):</h4>
          <div class="instant-match-list mt-2">
            <div class="instant-match-item glass-panel" *ngFor="let m of instantMatches">
              <div class="m-left">
                <span class="m-title">{{ m.project.title }}</span>
                <span class="tag-pill">{{ m.project.domain }}</span>
                <div class="m-techs">
                  <span class="tech-chip" *ngFor="let t of m.matchingTech">✓ {{ t }}</span>
                </div>
              </div>
              <div class="m-right">
                <span class="m-sim" [class.high]="m.score >= 50">{{ m.score }}%</span>
                <span class="m-sim-lbl">Overlap</span>
                <a [routerLink]="['/projects', m.project._id]" class="btn btn-secondary btn-sm mt-1">View Project</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Repository Projects Explorer Filters -->
      <div class="toolbar glass-panel mt-4">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="loadProjects()"
            placeholder="Search repository projects by keywords, concepts, or problem..."
          />
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <select [(ngModel)]="selectedDomain" (change)="loadProjects()">
              <option value="">All Domains</option>
              <option *ngFor="let d of domains" [value]="d">{{ d }}</option>
            </select>
          </div>

          <div class="filter-group">
            <input
              type="text"
              [(ngModel)]="techFilter"
              (input)="loadProjects()"
              placeholder="Filter by technology (e.g. OpenCV, IoT)"
            />
          </div>
        </div>
      </div>

      <!-- Projects Results -->
      <div class="results-meta" *ngIf="!isLoading">
        <span>Found <strong>{{ filteredProjects.length }}</strong> candidate projects in repository</span>
        <span *ngIf="filteredProjects.length < 5" class="warning-text">
          ⚠️ Comparison dataset has fewer than 5 projects matching these filters.
        </span>
      </div>

      <div class="projects-list-grid" *ngIf="!isLoading && filteredProjects.length > 0">
        <div class="project-mini-card glass-card" *ngFor="let proj of filteredProjects">
          <div class="mini-header">
            <span class="tag-pill">{{ proj.domain }}</span>
            <app-badge [status]="proj.status"></app-badge>
          </div>

          <h4 class="mini-title">
            <a [routerLink]="['/projects', proj._id]">{{ proj.title }}</a>
          </h4>

          <p class="mini-problem">
            {{ truncateText(proj.problemStatement, 120) }}
          </p>

          <div class="mini-tech">
            <span class="tech-tag" *ngFor="let t of (proj.technologies || []).slice(0, 3)">{{ t }}</span>
            <span *ngIf="(proj.technologies || []).length > 3" class="text-muted text-xs">
              +{{ (proj.technologies || []).length - 3 }}
            </span>
          </div>

          <div class="mini-footer">
            <a [routerLink]="['/projects', proj._id]" class="btn btn-secondary btn-sm">
              Inspect & Run Similarity →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .similarity-explorer-container {
      padding: 32px 24px;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .explorer-header {
      padding: 32px;
      border: 1px solid var(--border-subtle);
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.25);
      color: var(--accent-cyan);
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .explorer-header h2 {
      font-size: 1.85rem;
      margin-bottom: 6px;
    }

    .disclaimer-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 20px;
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: var(--radius-md);
    }

    .disclaimer-icon {
      font-size: 1.25rem;
    }

    .disclaimer-text {
      font-size: 0.825rem;
      color: #c7d2fe;
      line-height: 1.45;
    }

    .sandbox-card {
      padding: 24px;
      border: 1px solid var(--border-strong);
    }

    .sandbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sandbox-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .instant-match-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .instant-match-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      border-radius: var(--radius-md);
    }

    .m-title {
      font-weight: 600;
      font-size: 0.95rem;
      margin-right: 10px;
      color: var(--text-main);
    }

    .m-techs {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }

    .tech-chip {
      font-size: 0.75rem;
      color: var(--accent-emerald);
      background: rgba(16, 185, 129, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .m-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .m-sim {
      font-size: 1.4rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--accent-emerald);
    }

    .m-sim.high {
      color: var(--accent-rose);
    }

    .m-sim-lbl {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .toolbar {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .search-input-wrap {
      position: relative;
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
      gap: 12px;
    }

    .filter-group {
      flex: 1;
    }

    .results-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .warning-text {
      color: var(--accent-amber);
    }

    .projects-list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
    }

    .project-mini-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .mini-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .mini-title {
      font-size: 1.05rem;
      margin-bottom: 6px;
    }

    .mini-title a {
      color: var(--text-main);
    }

    .mini-title a:hover {
      color: var(--primary-400);
    }

    .mini-problem {
      font-size: 0.825rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
      line-height: 1.45;
    }

    .mini-tech {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 14px;
    }

    .tech-tag {
      font-size: 0.725rem;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.12);
      color: var(--primary-100);
    }

    .mini-footer {
      padding-top: 10px;
      border-top: 1px solid var(--border-subtle);
    }

    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .mt-4 { margin-top: 16px; }
    .text-xs { font-size: 0.75rem; }
  `]
})
export class SimilaritySearchComponent implements OnInit {
  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;

  searchQuery = '';
  selectedDomain = '';
  techFilter = '';

  // Instant Checker
  testText = '';
  instantMatches: { project: Project; score: number; matchingTech: string[] }[] = [];

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
    private similarityService: SimilarityService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getProjects({
      search: this.searchQuery || undefined,
      domain: this.selectedDomain || undefined
    }).subscribe({
      next: (res) => {
        let list = res.data;
        if (this.techFilter) {
          const tf = this.techFilter.toLowerCase();
          list = list.filter(p => (p.technologies || []).some(t => t.toLowerCase().includes(tf)));
        }
        this.filteredProjects = list;
        this.allProjects = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  runInstantTest() {
    if (!this.testText.trim()) return;

    const queryTokens = new Set(
      this.testText.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2)
    );

    const matches: { project: Project; score: number; matchingTech: string[] }[] = [];

    for (const p of this.allProjects) {
      const projText = `${p.title} ${p.problemStatement} ${p.proposedSolution}`.toLowerCase();
      let matchCount = 0;

      for (const t of queryTokens) {
        if (projText.includes(t)) matchCount++;
      }

      const matchingTech = (p.technologies || []).filter(tech =>
        this.testText.toLowerCase().includes(tech.toLowerCase())
      );

      const overlapScore = Math.min(
        Math.round((matchCount / Math.max(queryTokens.size, 1)) * 60 + matchingTech.length * 15),
        95
      );

      if (overlapScore > 15) {
        matches.push({
          project: p,
          score: overlapScore,
          matchingTech
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    this.instantMatches = matches.slice(0, 5);
  }

  truncateText(text: string, maxLen = 120): string {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }
}
