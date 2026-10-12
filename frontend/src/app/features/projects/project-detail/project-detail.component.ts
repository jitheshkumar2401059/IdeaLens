import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { SimilarityService } from '../../../core/services/similarity.service';
import { VersionService } from '../../../core/services/version.service';
import { ReviewService } from '../../../core/services/review.service';
import { TraceabilityService } from '../../../core/services/traceability.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project } from '../../../core/models/project.model';
import { Analysis } from '../../../core/models/analysis.model';
import { SimilarityResult } from '../../../core/models/similarity.model';
import { ProjectVersion, VersionCompareResponse } from '../../../core/models/version.model';
import { Review, Comment } from '../../../core/models/review.model';
import { TraceabilityRequirementNode } from '../../../core/models/traceability.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BadgeComponent],
  template: `
    <div class="detail-container" *ngIf="project">
      <!-- Top Action Bar -->
      <div class="top-nav-bar">
        <a routerLink="/projects" class="back-link">← Back to Projects</a>

        <div class="action-buttons">
          <!-- Submit for Review Button (Students) -->
          <button
            *ngIf="canSubmitForReview()"
            class="btn btn-success"
            (click)="submitProjectForReview()"
            [disabled]="isSubmittingReview"
          >
            <span>🚀</span>
            <span>{{ project.status === 'revision_requested' ? 'Resubmit for Review' : 'Submit for Faculty Review' }}</span>
          </button>

          <!-- Analyze Idea Button -->
          <button
            class="btn btn-primary"
            (click)="runAnalysis()"
            [disabled]="isAnalyzing"
          >
            <span *ngIf="isAnalyzing" class="animate-spin">⚙️</span>
            <span *ngIf="!isAnalyzing">✨</span>
            <span>{{ isAnalyzing ? 'Running AI Engine...' : 'Analyze Idea' }}</span>
          </button>

          <!-- Edit Idea Button (Owner) -->
          <a
            *ngIf="isOwner() && project.status === 'draft'"
            [routerLink]="['/projects', project._id, 'edit']"
            class="btn btn-secondary"
          >
            ✏️ Edit
          </a>
        </div>
      </div>

      <!-- Hero Header Card -->
      <div class="project-hero glass-card">
        <div class="hero-top-meta">
          <div class="tags-left">
            <span class="domain-tag">{{ project.domain }}</span>
            <span class="version-badge">Version {{ project.currentVersion }}</span>
            <app-badge [status]="project.status"></app-badge>
          </div>
          <span class="date-meta">Created {{ project.createdAt | date:'mediumDate' }}</span>
        </div>

        <h1 class="hero-title">{{ project.title }}</h1>

        <div class="hero-author-row">
          <div class="author-badge">
            <span class="author-icon">👨‍🎓</span>
            <span>{{ getStudentName(project.studentId) }}</span>
          </div>
          <span class="dot-divider">•</span>
          <span>Target Users: <strong>{{ project.targetUsers }}</strong></span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-header glass-panel">
        <button
          class="tab-btn"
          [class.active]="activeTab === 'overview'"
          (click)="activeTab = 'overview'"
        >
          📋 Overview & Spec
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab === 'analysis'"
          (click)="activeTab = 'analysis'"
        >
          🤖 AI Analysis
          <span class="tab-indicator" *ngIf="analysis">●</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab === 'similarity'"
          (click)="activeTab = 'similarity'"
        >
          🧬 Similarity Engine
          <span class="tab-indicator" *ngIf="similarity">●</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab === 'suggestions'"
          (click)="activeTab = 'suggestions'"
        >
          💡 Innovation Suggestions
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab === 'versions'"
          (click)="activeTab = 'versions'; loadVersions()"
        >
          🕒 Versions & Diffs
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab === 'traceability'"
          (click)="activeTab = 'traceability'; loadTraceability()"
        >
          🌲 Traceability (ALM)
        </button>

        <button
          class="tab-btn"
          [class.active]="activeTab === 'reviews'"
          (click)="activeTab = 'reviews'; loadReviews()"
        >
          ⚖️ Faculty Reviews
          <span class="tab-counter" *ngIf="reviews.length > 0">{{ reviews.length }}</span>
        </button>
      </div>

      <!-- TAB 1: OVERVIEW & SPEC -->
      <div class="tab-content" *ngIf="activeTab === 'overview'">
        <div class="two-col-grid">
          <div class="glass-card">
            <h3 class="section-title">Problem Statement</h3>
            <p class="section-body">{{ project.problemStatement }}</p>
          </div>

          <div class="glass-card">
            <h3 class="section-title">Proposed Technical Solution</h3>
            <p class="section-body">{{ project.proposedSolution }}</p>
          </div>
        </div>

        <div class="glass-card mt-4">
          <h3 class="section-title">Technologies Involved</h3>
          <div class="tech-chips-wrap">
            <span class="tag-pill" *ngFor="let tech of project.technologies">
              {{ tech }}
            </span>
          </div>
        </div>

        <div class="glass-card mt-4">
          <h3 class="section-title">Key Capabilities & Features</h3>
          <ul class="features-list">
            <li *ngFor="let feat of project.keyFeatures">
              <span class="bullet">✓</span>
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>

        <div class="glass-card mt-4">
          <h3 class="section-title">Expected Deliverables & Outcome</h3>
          <p class="section-body">{{ project.expectedOutcome }}</p>
        </div>

        <div class="glass-card mt-4" *ngIf="(project.references || []).length > 0">
          <h3 class="section-title">References & Documentation</h3>
          <ul class="features-list">
            <li *ngFor="let ref of project.references">
              <span class="bullet">🔗</span>
              <span>{{ ref }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- TAB 2: AI PROJECT ANALYSIS -->
      <div class="tab-content" *ngIf="activeTab === 'analysis'">
        <div *ngIf="!analysis" class="empty-analysis-box glass-card">
          <span class="ai-orb pulse-glow">🤖</span>
          <h3>No AI Analysis Generated Yet</h3>
          <p>Click "Analyze Idea" to send this project specification to Gemini AI for deep evaluation.</p>
          <button class="btn btn-primary" (click)="runAnalysis()" [disabled]="isAnalyzing">
            {{ isAnalyzing ? 'Running Gemini Analysis...' : 'Generate AI Analysis Now' }}
          </button>
        </div>

        <div *ngIf="analysis" class="analysis-results">
          <!-- Model and Score Banner -->
          <div class="glass-panel model-banner">
            <div class="model-info">
              <span class="model-badge">Engine: {{ analysis.aiModelUsed }}</span>
              <span class="fallback-note" *ngIf="analysis.isFallback">
                (Deterministic academic evaluation model)
              </span>
            </div>
            <div class="score-pill">
              <span class="score-label">Overall Idea Score</span>
              <span class="score-num">{{ analysis.overallScore }}/100</span>
            </div>
          </div>

          <!-- Executive Summary -->
          <div class="glass-card mt-4">
            <h3 class="section-title">1. Executive Summary</h3>
            <p class="section-body">{{ analysis.projectSummary }}</p>
          </div>

          <!-- 2-Col Critique -->
          <div class="two-col-grid mt-4">
            <div class="glass-card">
              <h3 class="section-title">2. Problem Formulation Analysis</h3>
              <p class="section-body">{{ analysis.problemAnalysis }}</p>
            </div>
            <div class="glass-card">
              <h3 class="section-title">3. Solution Architecture Analysis</h3>
              <p class="section-body">{{ analysis.solutionAnalysis }}</p>
            </div>
          </div>

          <div class="two-col-grid mt-4">
            <div class="glass-card">
              <h3 class="section-title">4. Target User & Adoption Fit</h3>
              <p class="section-body">{{ analysis.targetUsersAnalysis }}</p>
            </div>
            <div class="glass-card">
              <h3 class="section-title">5. Technologies & Stack Feasibility</h3>
              <p class="section-body">{{ analysis.technologiesAnalysis }}</p>
            </div>
          </div>

          <!-- Strengths & Weaknesses -->
          <div class="two-col-grid mt-4">
            <div class="glass-card border-green">
              <h3 class="section-title text-green">6. Identified Strengths</h3>
              <ul class="features-list">
                <li *ngFor="let s of analysis.strengths">
                  <span class="bullet text-green">+</span>
                  <span>{{ s }}</span>
                </li>
              </ul>
            </div>

            <div class="glass-card border-amber">
              <h3 class="section-title text-amber">7. Identified Weaknesses & Risks</h3>
              <ul class="features-list">
                <li *ngFor="let w of analysis.weaknesses">
                  <span class="bullet text-amber">-</span>
                  <span>{{ w }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Potential Challenges & Innovation Opportunities -->
          <div class="two-col-grid mt-4">
            <div class="glass-card border-rose">
              <h3 class="section-title text-rose">8. Technical & Deployment Challenges</h3>
              <ul class="features-list">
                <li *ngFor="let c of analysis.potentialChallenges">
                  <span class="bullet text-rose">⚠</span>
                  <span>{{ c }}</span>
                </li>
              </ul>
            </div>

            <div class="glass-card border-cyan">
              <h3 class="section-title text-cyan">9. Innovation & Differentiation Opportunities</h3>
              <ul class="features-list">
                <li *ngFor="let op of analysis.innovationOpportunities">
                  <span class="bullet text-cyan">★</span>
                  <span>{{ op }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Real World Applications & Limitations -->
          <div class="two-col-grid mt-4">
            <div class="glass-card">
              <h3 class="section-title">10. Real-World Societal & Commercial Applications</h3>
              <ul class="features-list">
                <li *ngFor="let app of analysis.potentialRealWorldApplications">
                  <span class="bullet">🌍</span>
                  <span>{{ app }}</span>
                </li>
              </ul>
            </div>

            <div class="glass-card">
              <h3 class="section-title">11. Inherent Constraints & Limitations</h3>
              <ul class="features-list">
                <li *ngFor="let lim of analysis.potentialLimitations">
                  <span class="bullet">⚡</span>
                  <span>{{ lim }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: SIMILARITY ANALYSIS & NOVELTY -->
      <div class="tab-content" *ngIf="activeTab === 'similarity'">
        <!-- Critical Legal Novelty Disclaimer as mandated -->
        <div class="disclaimer-banner glass-panel">
          <div class="disclaimer-icon">ℹ️</div>
          <div class="disclaimer-text">
            <strong>Important Notice:</strong>
            {{ similarity?.disclaimer || 'This analysis provides educational AI-assisted similarity and differentiation comparisons against existing projects in the IdeaLens database. It does not constitute a legal patentability search, intellectual property audit, or legal novelty determination.' }}
          </div>
        </div>

        <div *ngIf="similarity && similarity.topMatches.length > 0" class="similarity-metrics-summary">
          <div class="metric-pill">
            <span>Repository Compared:</span>
            <strong>{{ similarity.totalProjectsCompared }} Projects</strong>
          </div>
          <div class="metric-pill">
            <span>Highest Similarity Match:</span>
            <strong [class.text-amber]="similarity.highestSimilarityPercentage > 60">
              {{ similarity.highestSimilarityPercentage }}%
            </strong>
          </div>
          <div class="metric-pill">
            <span>Average Overlap:</span>
            <strong>{{ similarity.averageSimilarityPercentage }}%</strong>
          </div>
        </div>

        <!-- Matches Cards List -->
        <div class="similar-matches-list" *ngIf="similarity && similarity.topMatches.length > 0">
          <div class="match-card glass-card" *ngFor="let match of similarity.topMatches; let i = index">
            <div class="match-card-header">
              <div>
                <span class="match-rank">#{{ i + 1 }} Similar Project</span>
                <h4 class="match-title">
                  <a [routerLink]="['/projects', match.similarProjectId]">{{ match.title }}</a>
                </h4>
                <span class="tag-pill">{{ match.domain }}</span>
              </div>

              <div class="sim-score-box">
                <div class="sim-percentage" [ngClass]="getSimilarityColorClass(match.similarityPercentage)">
                  {{ match.similarityPercentage }}%
                </div>
                <span class="sim-label">Similarity</span>
              </div>
            </div>

            <!-- Breakdown: Common vs Differentiating Concepts -->
            <div class="comparison-breakdown">
              <div class="comp-col common-col">
                <h5>Matching Technologies & Concepts</h5>
                <div class="comp-tags" *ngIf="match.matchingTechnologies.length > 0">
                  <span class="tag-pill common-tech" *ngFor="let t of match.matchingTechnologies">
                    {{ t }}
                  </span>
                </div>
                <ul class="comp-list">
                  <li *ngFor="let concept of match.matchingProblemConcepts.concat(match.matchingSolutionConcepts).slice(0, 4)">
                    ✓ {{ concept }}
                  </li>
                </ul>
              </div>

              <div class="comp-col diff-col">
                <h5>Distinct Differentiators</h5>
                <ul class="comp-list diff-list">
                  <li *ngFor="let diff of match.differences">
                    ✦ {{ diff }}
                  </li>
                  <li *ngIf="match.differences.length === 0">
                    Unique implementation logic and distinct architectural features
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!similarity || similarity.topMatches.length === 0" class="empty-state-box glass-card">
          <span>🔍</span>
          <h3>No Similar Projects Found</h3>
          <p>This project has an exceptionally differentiated profile, or the repository dataset has limited domain overlap.</p>
        </div>
      </div>

      <!-- TAB 4: INNOVATION SUGGESTIONS -->
      <div class="tab-content" *ngIf="activeTab === 'suggestions'">
        <div *ngIf="!analysis" class="empty-analysis-box glass-card">
          <p>Run "Analyze Idea" first to generate categorized innovation suggestions.</p>
          <button class="btn btn-primary" (click)="runAnalysis()">Analyze Idea</button>
        </div>

        <div *ngIf="analysis" class="suggestions-container">
          <!-- 5 Categorized Suggestion Cards -->
          <div class="suggestion-card glass-card">
            <div class="sugg-header">
              <span class="sugg-icon">✨</span>
              <h4>Feature Improvements</h4>
            </div>
            <ul class="features-list">
              <li *ngFor="let item of analysis.possibleImprovements.featureImprovements">
                <span class="bullet text-cyan">➔</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="suggestion-card glass-card">
            <div class="sugg-header">
              <span class="sugg-icon">⚙️</span>
              <h4>Technology & Architectural Improvements</h4>
            </div>
            <ul class="features-list">
              <li *ngFor="let item of analysis.possibleImprovements.technologyImprovements">
                <span class="bullet text-green">➔</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="suggestion-card glass-card">
            <div class="sugg-header">
              <span class="sugg-icon">👥</span>
              <h4>User Experience & Interface Enhancements</h4>
            </div>
            <ul class="features-list">
              <li *ngFor="let item of analysis.possibleImprovements.userExperienceImprovements">
                <span class="bullet text-amber">➔</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="suggestion-card glass-card">
            <div class="sugg-header">
              <span class="sugg-icon">📈</span>
              <h4>Scalability & Performance Improvements</h4>
            </div>
            <ul class="features-list">
              <li *ngFor="let item of analysis.possibleImprovements.scalabilityImprovements">
                <span class="bullet text-purple">➔</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="suggestion-card glass-card highlight-sugg">
            <div class="sugg-header">
              <span class="sugg-icon">🚀</span>
              <h4>Differentiation & Novelty Opportunities</h4>
            </div>
            <ul class="features-list">
              <li *ngFor="let item of analysis.possibleImprovements.differentiationOpportunities">
                <span class="bullet text-cyan">★</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- TAB 5: VERSIONS & COMPARISON -->
      <div class="tab-content" *ngIf="activeTab === 'versions'">
        <div class="version-action-bar">
          <h3>Project Version Control</h3>
          <button *ngIf="isOwner()" class="btn btn-primary btn-sm" (click)="showNewVersionModal = true">
            + Create New Version
          </button>
        </div>

        <!-- Versions Timeline -->
        <div class="versions-timeline">
          <div class="version-item glass-card" *ngFor="let ver of versions">
            <div class="ver-header">
              <div class="ver-title-row">
                <span class="ver-badge">v{{ ver.versionNumber }}</span>
                <span class="ver-date">{{ ver.createdAt | date:'medium' }}</span>
              </div>
              <span class="ver-summary">{{ ver.changeSummary }}</span>
            </div>
            <div class="ver-content">
              <strong>Title:</strong> {{ ver.title }}<br />
              <strong>Tech Stack:</strong> {{ (ver.technologies || []).join(', ') }}
            </div>
          </div>
        </div>

        <!-- Version Comparison Widget -->
        <div class="glass-card mt-6" *ngIf="versions.length >= 2">
          <h4 class="section-title">Compare Project Versions</h4>
          <div class="version-compare-controls">
            <div class="select-col">
              <label>Base Version</label>
              <select [(ngModel)]="compareV1">
                <option *ngFor="let v of versions" [value]="v.versionNumber">Version {{ v.versionNumber }}</option>
              </select>
            </div>
            <span class="vs-text">vs</span>
            <div class="select-col">
              <label>Target Version</label>
              <select [(ngModel)]="compareV2">
                <option *ngFor="let v of versions" [value]="v.versionNumber">Version {{ v.versionNumber }}</option>
              </select>
            </div>
            <button class="btn btn-secondary" (click)="runVersionComparison()">
              Compare Diffs
            </button>
          </div>

          <!-- Comparison Results -->
          <div class="compare-results glass-panel mt-4" *ngIf="comparisonResult">
            <h5>Differences between v{{ compareV1 }} and v{{ compareV2 }}:</h5>

            <div *ngIf="comparisonResult.diff.addedTechnologies.length > 0" class="diff-row">
              <span class="diff-label text-green">+ Added Technologies:</span>
              <span class="tag-pill" *ngFor="let t of comparisonResult.diff.addedTechnologies">{{ t }}</span>
            </div>

            <div *ngIf="comparisonResult.diff.removedTechnologies.length > 0" class="diff-row">
              <span class="diff-label text-rose">- Removed Technologies:</span>
              <span class="tag-pill" *ngFor="let t of comparisonResult.diff.removedTechnologies">{{ t }}</span>
            </div>

            <div *ngIf="comparisonResult.diff.addedFeatures.length > 0" class="diff-row">
              <span class="diff-label text-green">+ Added Features:</span>
              <span class="feature-diff" *ngFor="let f of comparisonResult.diff.addedFeatures">{{ f }}</span>
            </div>

            <div *ngIf="comparisonResult.diff.fieldChanges.length > 0" class="field-diffs-box mt-3">
              <div class="field-change-item" *ngFor="let fc of comparisonResult.diff.fieldChanges">
                <strong>{{ fc.field }}:</strong>
                <div class="change-before">Before: {{ fc.before }}</div>
                <div class="change-after">After: {{ fc.after }}</div>
              </div>
            </div>

            <div *ngIf="comparisonResult.diff.fieldChanges.length === 0 && comparisonResult.diff.addedTechnologies.length === 0" class="text-muted mt-2">
              No textual differences recorded between these iterations.
            </div>
          </div>
        </div>

        <!-- Create Version Modal -->
        <div class="modal-overlay" *ngIf="showNewVersionModal">
          <div class="modal-box glass-panel">
            <h4>Create Version {{ (project.currentVersion || 1) + 1 }}</h4>
            <p>Save changes as a new project iteration to compare revisions.</p>

            <div class="form-group mt-3">
              <label>Iteration Summary of Changes *</label>
              <input type="text" [(ngModel)]="newVersionSummary" placeholder="e.g. Added face recognition and anti-spoofing verification" />
            </div>

            <div class="form-group mt-3">
              <label>Updated Title</label>
              <input type="text" [(ngModel)]="newVersionTitle" [value]="project.title" />
            </div>

            <div class="form-group mt-3">
              <label>Updated Technologies (comma-separated)</label>
              <input type="text" [(ngModel)]="newVersionTech" />
            </div>

            <div class="modal-actions mt-4">
              <button class="btn btn-secondary" (click)="showNewVersionModal = false">Cancel</button>
              <button class="btn btn-primary" (click)="submitNewVersion()" [disabled]="!newVersionSummary">
                Save Version {{ (project.currentVersion || 1) + 1 }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 6: TRACEABILITY MATRIX -->
      <div class="tab-content" *ngIf="activeTab === 'traceability'">
        <div class="traceability-header">
          <div>
            <h3>Requirements Traceability Matrix</h3>
            <p>Traceability hierarchy: Project Idea ➔ Requirements ➔ Features ➔ Test Cases ➔ Issues</p>
          </div>

          <button *ngIf="isOwner()" class="btn btn-primary btn-sm" (click)="showNewReqModal = true">
            + Add Requirement
          </button>
        </div>

        <!-- Connected Tree Cards -->
        <div class="traceability-tree" *ngIf="traceabilityMatrix.length > 0">
          <div class="req-card glass-card" *ngFor="let req of traceabilityMatrix">
            <div class="req-header">
              <div class="req-code-badge">{{ req.reqCode }}</div>
              <h4 class="req-title">{{ req.title }}</h4>
              <span class="badge" [class.badge-approved]="req.status === 'completed'">{{ req.status }}</span>
              <div class="trace-actions" *ngIf="isOwner()">
                <button class="btn btn-secondary btn-xs" (click)="openAddFeatureModal(req._id)" title="Add Feature">
                  + Feature
                </button>
                <button class="btn-delete-icon" (click)="deleteRequirement(req._id)" title="Delete Requirement">
                  🗑️
                </button>
              </div>
            </div>
            <p class="req-desc">{{ req.description }}</p>

            <!-- Features attached to this Requirement -->
            <div class="features-nested-box" *ngIf="(req.features || []).length > 0">
              <div class="feat-label">Attached Features:</div>
              <div class="feat-item glass-panel" *ngFor="let feat of req.features">
                <div class="feat-row">
                  <span class="feat-code">{{ feat.code }}</span>
                  <span class="feat-title">{{ feat.title }}</span>
                  <span class="tag-pill">{{ feat.status }}</span>
                  <div class="trace-actions" *ngIf="isOwner()">
                    <button class="btn btn-secondary btn-xs" (click)="openAddTestCaseModal(feat._id, req._id)" title="Add Test Case">
                      + Test Case
                    </button>
                    <button class="btn btn-secondary btn-xs" (click)="openAddIssueModal(feat._id, req._id)" title="Report Issue">
                      + Issue
                    </button>
                    <button class="btn-delete-icon" (click)="deleteFeature(feat._id)" title="Delete Feature">
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Test Cases under this Feature -->
                <div class="tests-nested" *ngIf="(feat.testCases || []).length > 0">
                  <div class="test-item" *ngFor="let tc of feat.testCases">
                    <span class="tc-code">{{ tc.code }}</span>
                    <span class="tc-title">{{ tc.title }}</span>
                    <span class="tc-status" [class.passed]="tc.status === 'passed'">{{ tc.status }}</span>
                    <div class="trace-actions-mini" *ngIf="isOwner()">
                      <button class="btn btn-secondary btn-xxs" (click)="openAddIssueModal(feat._id, req._id, tc._id)" title="Report Issue on Test Case">
                        + Issue
                      </button>
                      <button class="btn-delete-icon-sm" (click)="deleteTestCase(tc._id)" title="Delete Test Case">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Issues under this Feature -->
                <div class="issues-nested" *ngIf="(feat.issues || []).length > 0">
                  <div class="issue-item" *ngFor="let iss of feat.issues">
                    <span class="iss-code">{{ iss.code }}</span>
                    <span class="iss-title">{{ iss.title }}</span>
                    <span class="iss-sev">{{ iss.severity }}</span>
                    <span class="tag-pill">{{ iss.status }}</span>
                    <button *ngIf="isOwner()" class="btn-delete-icon-sm" (click)="deleteIssue(iss._id)" title="Delete Issue">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="traceabilityMatrix.length === 0" class="empty-state-box glass-card">
          <span>🌲</span>
          <h3>No Requirements Configured Yet</h3>
          <p>Break down this project into functional requirements and test specifications.</p>
        </div>

        <!-- Add Requirement Modal -->
        <div class="modal-overlay" *ngIf="showNewReqModal">
          <div class="modal-box glass-panel">
            <h4>Add New Requirement</h4>
            <div class="form-group mt-3">
              <label>Requirement Title *</label>
              <input type="text" [(ngModel)]="newReqTitle" placeholder="e.g. Automated Route Optimization" />
            </div>
            <div class="form-group mt-3">
              <label>Description *</label>
              <textarea rows="3" [(ngModel)]="newReqDesc" placeholder="Detailed engineering requirement..."></textarea>
            </div>
            <div class="form-group mt-3">
              <label>Priority</label>
              <select [(ngModel)]="newReqPriority">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div class="modal-actions mt-4">
              <button class="btn btn-secondary" (click)="showNewReqModal = false">Cancel</button>
              <button class="btn btn-primary" (click)="submitRequirement()" [disabled]="!newReqTitle">
                Save Requirement
              </button>
            </div>
          </div>
        </div>

        <!-- Add Feature Modal -->
        <div class="modal-overlay" *ngIf="showNewFeatModal">
          <div class="modal-box glass-panel">
            <h4>Add Feature under Requirement</h4>
            <div class="form-group mt-3">
              <label>Feature Title *</label>
              <input type="text" [(ngModel)]="newFeatTitle" placeholder="e.g. Real-Time Telemetry Streaming" />
            </div>
            <div class="form-group mt-3">
              <label>Feature Description</label>
              <textarea rows="3" [(ngModel)]="newFeatDesc" placeholder="Functional capability details..."></textarea>
            </div>
            <div class="form-group mt-3">
              <label>Complexity</label>
              <select [(ngModel)]="newFeatComplexity">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            <div class="modal-actions mt-4">
              <button class="btn btn-secondary" (click)="showNewFeatModal = false">Cancel</button>
              <button class="btn btn-primary" (click)="submitFeature()" [disabled]="!newFeatTitle">
                Save Feature
              </button>
            </div>
          </div>
        </div>

        <!-- Add Test Case Modal -->
        <div class="modal-overlay" *ngIf="showNewTcModal">
          <div class="modal-box glass-panel">
            <h4>Add Test Case</h4>
            <div class="form-group mt-3">
              <label>Test Case Title *</label>
              <input type="text" [(ngModel)]="newTcTitle" placeholder="e.g. Verify Latency Below 50ms" />
            </div>
            <div class="form-group mt-3">
              <label>Description</label>
              <textarea rows="2" [(ngModel)]="newTcDesc" placeholder="Test execution steps..."></textarea>
            </div>
            <div class="form-group mt-3">
              <label>Expected Result *</label>
              <input type="text" [(ngModel)]="newTcExpected" placeholder="e.g. Telemetry packet acknowledged in <50ms" />
            </div>
            <div class="modal-actions mt-4">
              <button class="btn btn-secondary" (click)="showNewTcModal = false">Cancel</button>
              <button class="btn btn-primary" (click)="submitTestCase()" [disabled]="!newTcTitle || !newTcExpected">
                Save Test Case
              </button>
            </div>
          </div>
        </div>

        <!-- Add Issue Modal -->
        <div class="modal-overlay" *ngIf="showNewIssueModal">
          <div class="modal-box glass-panel">
            <h4>Report Issue / Bug</h4>
            <div class="form-group mt-3">
              <label>Issue Title *</label>
              <input type="text" [(ngModel)]="newIssueTitle" placeholder="e.g. Packet drop on Wi-Fi reconnect" />
            </div>
            <div class="form-group mt-3">
              <label>Issue Description</label>
              <textarea rows="2" [(ngModel)]="newIssueDesc" placeholder="Root cause or bug behavior..."></textarea>
            </div>
            <div class="form-group mt-3">
              <label>Severity</label>
              <select [(ngModel)]="newIssueSeverity">
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
            <div class="modal-actions mt-4">
              <button class="btn btn-secondary" (click)="showNewIssueModal = false">Cancel</button>
              <button class="btn btn-primary" (click)="submitIssue()" [disabled]="!newIssueTitle">
                Save Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 7: FACULTY REVIEWS & FEEDBACK -->
      <div class="tab-content" *ngIf="activeTab === 'reviews'">
        <div class="reviews-container">
          <!-- Faculty Evaluation Form (Only for Faculty or Admin) -->
          <div class="glass-card review-form-card" *ngIf="authService.isFaculty() || authService.isAdmin()">
            <h3>Faculty Review & Rubric Evaluation</h3>
            <p>Assess proposal originality, feasibility, and recommend workflow decisions.</p>

            <form (ngSubmit)="submitFacultyReview()" class="mt-4">
              <div class="form-group">
                <label>Review Decision *</label>
                <select [(ngModel)]="reviewDecision" name="reviewDecision" required>
                  <option value="approved">Approve Project Idea</option>
                  <option value="revision_requested">Request Revisions & Modifications</option>
                  <option value="under_review">Mark Under Active Review</option>
                  <option value="rejected">Reject / Needs Substantial Overhaul</option>
                </select>
              </div>

              <!-- Rubric Ratings -->
              <div class="rubric-grid mt-3">
                <div class="rubric-item">
                  <label>Problem Clarity (1-5)</label>
                  <input type="number" min="1" max="5" [(ngModel)]="rubric.problemClarity" name="clarity" />
                </div>
                <div class="rubric-item">
                  <label>Innovation & Novelty (1-5)</label>
                  <input type="number" min="1" max="5" [(ngModel)]="rubric.innovationNovelty" name="novelty" />
                </div>
                <div class="rubric-item">
                  <label>Technical Feasibility (1-5)</label>
                  <input type="number" min="1" max="5" [(ngModel)]="rubric.technicalFeasibility" name="feasibility" />
                </div>
                <div class="rubric-item">
                  <label>Societal Impact (1-5)</label>
                  <input type="number" min="1" max="5" [(ngModel)]="rubric.societalImpact" name="impact" />
                </div>
              </div>

              <div class="form-group mt-3">
                <label>Faculty Critique & Constructive Feedback *</label>
                <textarea
                  rows="4"
                  [(ngModel)]="reviewComments"
                  name="reviewComments"
                  required
                  placeholder="Provide detailed feedback on project scope, methodology, sensor selection, or algorithms..."
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary mt-3" [disabled]="!reviewComments">
                Submit Official Review
              </button>
            </form>
          </div>

          <!-- Existing Reviews Timeline -->
          <div class="glass-card mt-4">
            <h3>Faculty Review Decisions History</h3>
            <div class="reviews-list mt-3">
              <div class="review-entry glass-panel" *ngFor="let rev of reviews">
                <div class="rev-header">
                  <div class="rev-author-info">
                    <span class="rev-name">Reviewed by {{ rev.facultyId?.name || 'Faculty Member' }}</span>
                    <span class="rev-date">{{ rev.createdAt | date:'medium' }}</span>
                  </div>
                  <app-badge [status]="rev.statusDecision"></app-badge>
                </div>

                <div class="rubric-scores-bar" *ngIf="rev.criteriaRatings">
                  <span>Clarity: <strong>{{ rev.criteriaRatings.problemClarity }}/5</strong></span>
                  <span>Novelty: <strong>{{ rev.criteriaRatings.innovationNovelty }}/5</strong></span>
                  <span>Feasibility: <strong>{{ rev.criteriaRatings.technicalFeasibility }}/5</strong></span>
                  <span>Impact: <strong>{{ rev.criteriaRatings.societalImpact }}/5</strong></span>
                </div>

                <p class="rev-comments">{{ rev.comments }}</p>
              </div>

              <div *ngIf="reviews.length === 0" class="text-muted py-3">
                No formal faculty reviews logged yet. Submit your project to request academic review.
              </div>
            </div>
          </div>

          <!-- Threaded Discussion & Comments -->
          <div class="glass-card mt-4">
            <h3>Discussion Thread</h3>
            <div class="comments-list mt-3">
              <div class="comment-item" *ngFor="let c of comments">
                <div class="comment-meta">
                  <span class="comment-author">{{ c.authorId?.name || 'User' }}</span>
                  <span class="role-badge" [ngClass]="'role-' + c.authorRole">{{ c.authorRole | uppercase }}</span>
                  <span class="comment-time">{{ c.createdAt | date:'shortTime' }}</span>
                </div>
                <div class="comment-content">{{ c.content }}</div>
              </div>
            </div>

            <!-- Add Comment Box -->
            <div class="add-comment-box mt-3">
              <input
                type="text"
                [(ngModel)]="newCommentContent"
                (keyup.enter)="addDiscussionComment()"
                placeholder="Ask a clarifying question or respond to faculty notes..."
              />
              <button class="btn btn-secondary" (click)="addDiscussionComment()" [disabled]="!newCommentContent">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="isLoadingProject && !project" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
      <span class="animate-spin text-2xl" style="display: block; font-size: 2rem; margin-bottom: 12px;">⏳</span>
      <span>Loading project details from MongoDB...</span>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 32px 24px;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .top-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .back-link {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .project-hero {
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border: 1px solid var(--border-subtle);
    }

    .hero-top-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tags-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .domain-tag {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent-cyan);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .version-badge {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .date-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .hero-title {
      font-size: 2rem;
      line-height: 1.25;
    }

    .hero-author-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .author-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-main);
      font-weight: 600;
    }

    .dot-divider {
      color: var(--text-muted);
    }

    .tabs-header {
      display: flex;
      gap: 4px;
      padding: 6px;
      overflow-x: auto;
    }

    .tab-btn {
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.04);
    }

    .tab-btn.active {
      background: rgba(99, 102, 241, 0.2);
      color: #ffffff;
      border: 1px solid rgba(99, 102, 241, 0.35);
    }

    .tab-indicator {
      color: var(--accent-emerald);
      font-size: 0.65rem;
    }

    .tab-counter {
      background: var(--primary-500);
      color: #ffffff;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 9999px;
    }

    .tab-content {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 800px) {
      .two-col-grid {
        grid-template-columns: 1fr;
      }
    }

    .mt-4 { margin-top: 16px; }
    .mt-6 { margin-top: 24px; }

    .section-title {
      font-size: 1.05rem;
      margin-bottom: 10px;
    }

    .section-body {
      font-size: 0.925rem;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .tech-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .features-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .features-list li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .bullet {
      color: var(--primary-400);
      font-weight: bold;
    }

    /* AI Analysis View */
    .empty-analysis-box {
      text-align: center;
      padding: 60px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .ai-orb {
      font-size: 3.5rem;
    }

    .model-banner {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .model-badge {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }

    .fallback-note {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-left: 8px;
    }

    .score-pill {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .score-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .score-num {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--accent-emerald);
      font-family: var(--font-heading);
    }

    .border-green { border-left: 4px solid var(--accent-emerald); }
    .border-amber { border-left: 4px solid var(--accent-amber); }
    .border-rose { border-left: 4px solid var(--accent-rose); }
    .border-cyan { border-left: 4px solid var(--accent-cyan); }

    .text-green { color: var(--accent-emerald); }
    .text-amber { color: var(--accent-amber); }
    .text-rose { color: var(--accent-rose); }
    .text-cyan { color: var(--accent-cyan); }
    .text-purple { color: var(--accent-purple); }

    /* Similarity View */
    .disclaimer-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }

    .disclaimer-icon {
      font-size: 1.2rem;
    }

    .disclaimer-text {
      font-size: 0.825rem;
      line-height: 1.45;
      color: #bae6fd;
    }

    .similarity-metrics-summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .metric-pill {
      padding: 8px 16px;
      border-radius: var(--radius-md);
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      display: flex;
      gap: 8px;
      font-size: 0.85rem;
    }

    .similar-matches-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .match-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .match-rank {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .match-title {
      font-size: 1.15rem;
      margin: 4px 0 6px;
    }

    .sim-score-box {
      text-align: center;
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .sim-percentage {
      font-size: 1.5rem;
      font-weight: 800;
      font-family: var(--font-heading);
    }

    .sim-high { color: var(--accent-rose); }
    .sim-med { color: var(--accent-amber); }
    .sim-low { color: var(--accent-emerald); }

    .sim-label {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .comparison-breakdown {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
    }

    @media (max-width: 700px) {
      .comparison-breakdown {
        grid-template-columns: 1fr;
      }
    }

    .comp-col h5 {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .comp-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .common-tech {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
      color: var(--accent-emerald);
    }

    .comp-list {
      list-style: none;
      font-size: 0.825rem;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .diff-list li {
      color: #93c5fd;
    }

    /* Suggestions View */
    .suggestions-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sugg-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .sugg-header h4 {
      font-size: 1.05rem;
    }

    .highlight-sugg {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
      border-color: rgba(99, 102, 241, 0.35);
    }

    /* Versions View */
    .version-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .versions-timeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ver-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .ver-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ver-badge {
      background: var(--primary-gradient);
      color: #ffffff;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .ver-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .ver-summary {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .ver-content {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .version-compare-controls {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: wrap;
    }

    .vs-text {
      font-weight: 700;
      color: var(--text-muted);
      padding-bottom: 10px;
    }

    .diff-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
      font-size: 0.85rem;
    }

    .diff-label {
      font-weight: 600;
    }

    .feature-diff {
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-emerald);
      font-size: 0.8rem;
    }

    .field-change-item {
      padding: 8px 12px;
      border-left: 3px solid var(--accent-cyan);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 4px;
      margin-top: 8px;
      font-size: 0.85rem;
    }

    .change-before {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .change-after {
      color: var(--text-main);
      font-weight: 500;
    }

    /* Traceability View */
    .traceability-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .traceability-tree {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .req-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .req-code-badge {
      background: rgba(99, 102, 241, 0.2);
      color: var(--primary-400);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .req-title {
      font-size: 1.05rem;
      flex: 1;
    }

    .req-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }

    .features-nested-box {
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .feat-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .feat-item {
      padding: 10px 14px;
      border-radius: var(--radius-md);
    }

    .feat-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .feat-code {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--accent-cyan);
    }

    .feat-title {
      font-size: 0.85rem;
      font-weight: 600;
      flex: 1;
    }

    .tests-nested {
      margin-top: 8px;
      padding-left: 14px;
      border-left: 2px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .test-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .tc-code {
      font-family: var(--font-mono);
      color: var(--primary-400);
    }

    .tc-status.passed {
      color: var(--accent-emerald);
      font-weight: bold;
    }

    .trace-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }

    .trace-actions-mini {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
    }

    .btn-xs {
      padding: 3px 8px;
      font-size: 0.725rem;
    }

    .btn-xxs {
      padding: 1px 6px;
      font-size: 0.675rem;
    }

    .btn-delete-icon-sm {
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      opacity: 0.6;
      font-size: 0.75rem;
      color: var(--accent-rose);
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-delete-icon-sm:hover {
      opacity: 1;
      background: rgba(244, 63, 94, 0.2);
    }

    .issues-nested {
      margin-top: 8px;
      padding-left: 14px;
      border-left: 2px solid rgba(244, 63, 94, 0.2);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .issue-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.775rem;
      color: var(--text-secondary);
    }

    .iss-code {
      font-family: var(--font-mono);
      color: var(--accent-rose);
    }

    .iss-title {
      flex: 1;
    }

    .iss-sev {
      font-size: 0.65rem;
      text-transform: uppercase;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(244, 63, 94, 0.1);
      color: var(--accent-rose);
      font-weight: 600;
    }

    /* Reviews View */
    .rubric-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    @media (max-width: 600px) {
      .rubric-grid { grid-template-columns: 1fr 1fr; }
    }

    .rubric-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rubric-item label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .review-entry {
      padding: 16px;
      border-radius: var(--radius-md);
      margin-bottom: 12px;
    }

    .rev-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .rev-name {
      font-weight: 600;
      font-size: 0.875rem;
      margin-right: 10px;
    }

    .rev-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .rubric-scores-bar {
      display: flex;
      gap: 16px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 10px;
      background: rgba(255, 255, 255, 0.03);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
    }

    .rev-comments {
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--text-main);
    }

    /* Discussion Thread */
    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 320px;
      overflow-y: auto;
    }

    .comment-item {
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-md);
    }

    .comment-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .comment-author {
      font-weight: 600;
      font-size: 0.8rem;
    }

    .comment-time {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-left: auto;
    }

    .comment-content {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .add-comment-box {
      display: flex;
      gap: 8px;
    }

    /* Modals */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .modal-box {
      width: 100%;
      max-width: 520px;
      padding: 28px;
      background: rgba(15, 23, 42, 0.98);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  project!: Project;
  projectId!: string;
  activeTab: 'overview' | 'analysis' | 'similarity' | 'suggestions' | 'versions' | 'traceability' | 'reviews' = 'overview';

  analysis: Analysis | null = null;
  similarity: SimilarityResult | null = null;
  versions: ProjectVersion[] = [];
  reviews: Review[] = [];
  comments: Comment[] = [];
  traceabilityMatrix: TraceabilityRequirementNode[] = [];

  isAnalyzing = false;
  isSubmittingReview = false;
  isLoadingProject = true;

  // Version Diff state
  compareV1 = 1;
  compareV2 = 2;
  comparisonResult: VersionCompareResponse['data'] | null = null;
  showNewVersionModal = false;
  newVersionSummary = '';
  newVersionTitle = '';
  newVersionTech = '';

  // Traceability Modals & State
  showNewReqModal = false;
  newReqTitle = '';
  newReqDesc = '';
  newReqPriority: 'critical' | 'high' | 'medium' | 'low' = 'high';

  showNewFeatModal = false;
  selectedReqId = '';
  newFeatTitle = '';
  newFeatDesc = '';
  newFeatComplexity: 'easy' | 'medium' | 'complex' = 'medium';

  showNewTcModal = false;
  selectedFeatId = '';
  newTcTitle = '';
  newTcDesc = '';
  newTcExpected = '';

  showNewIssueModal = false;
  selectedTcId = '';
  newIssueTitle = '';
  newIssueDesc = '';
  newIssueSeverity: 'critical' | 'major' | 'minor' = 'major';

  // Faculty Review Form
  reviewDecision = 'approved';
  reviewComments = '';
  rubric = {
    problemClarity: 4,
    innovationNovelty: 4,
    technicalFeasibility: 4,
    societalImpact: 4
  };

  // Discussion
  newCommentContent = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private analysisService: AnalysisService,
    private similarityService: SimilarityService,
    private versionService: VersionService,
    private reviewService: ReviewService,
    private traceabilityService: TraceabilityService,
    public authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam && ['overview', 'analysis', 'similarity', 'suggestions', 'versions', 'traceability', 'reviews'].includes(tabParam)) {
      this.activeTab = tabParam as any;
    }
    this.loadProject();

    if (this.activeTab === 'reviews') {
      this.loadReviews();
    } else if (this.activeTab === 'traceability') {
      this.loadTraceability();
    } else if (this.activeTab === 'versions') {
      this.loadVersions();
    }
  }

  loadProject() {
    this.isLoadingProject = true;
    this.projectService.getProjectById(this.projectId).pipe(
      finalize(() => {
        this.isLoadingProject = false;
      })
    ).subscribe({
      next: (res) => {
        this.project = res.data;
        this.loadAnalysis();
        this.loadSimilarity();
      },
      error: () => {
        this.toast.error('Project not found');
        this.router.navigate(['/projects']);
      }
    });
  }

  loadAnalysis() {
    this.analysisService.getAnalysis(this.projectId, this.project.currentVersion).subscribe({
      next: (res) => {
        this.analysis = res.data;
      },
      error: () => {}
    });
  }

  loadSimilarity() {
    this.similarityService.getSimilarForProject(this.projectId, this.project.currentVersion).subscribe({
      next: (res) => {
        this.similarity = res.data;
      },
      error: () => {}
    });
  }

  runAnalysis() {
    this.isAnalyzing = true;
    this.analysisService.analyzeProject(this.projectId).pipe(
      finalize(() => {
        this.isAnalyzing = false;
      })
    ).subscribe({
      next: (res) => {
        this.analysis = res.data.analysis;
        this.similarity = res.data.similarity;
        this.toast.success('AI Idea & Similarity Analysis generated!');
        this.activeTab = 'analysis';
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Analysis error occurred');
      }
    });
  }

  submitProjectForReview() {
    this.isSubmittingReview = true;
    this.projectService.submitProject(this.projectId).pipe(
      finalize(() => {
        this.isSubmittingReview = false;
      })
    ).subscribe({
      next: (res) => {
        this.project.status = res.data.status;
        this.toast.success('Project submitted for faculty evaluation!');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Submission failed');
      }
    });
  }

  canSubmitForReview(): boolean {
    if (!this.isOwner()) return false;
    return this.project.status === 'draft' || this.project.status === 'revision_requested';
  }

  isOwner(): boolean {
    const currentUserId = this.authService.currentUser()?.id || (this.authService.currentUser() as any)?._id;
    const studentId = typeof this.project?.studentId === 'object' ? (this.project.studentId as any)._id : this.project?.studentId;
    return currentUserId === studentId;
  }

  getStudentName(student: any): string {
    if (!student) return 'Student';
    if (typeof student === 'object') return student.name || 'Student';
    return 'Student';
  }

  getSimilarityColorClass(pct: number): string {
    if (pct >= 70) return 'sim-high';
    if (pct >= 40) return 'sim-med';
    return 'sim-low';
  }

  // Versions Tab
  loadVersions() {
    this.versionService.getVersions(this.projectId).subscribe({
      next: (res) => {
        this.versions = res.data;
        if (this.versions.length >= 2) {
          this.compareV1 = this.versions[this.versions.length - 1].versionNumber;
          this.compareV2 = this.versions[0].versionNumber;
          this.runVersionComparison();
        }
      }
    });
  }

  runVersionComparison() {
    this.versionService.compareVersions(this.projectId, this.compareV1, this.compareV2).subscribe({
      next: (res) => {
        this.comparisonResult = res.data;
      }
    });
  }

  submitNewVersion() {
    const payload: Partial<ProjectVersion> = {
      changeSummary: this.newVersionSummary,
      title: this.newVersionTitle || this.project.title,
      technologies: this.newVersionTech ? this.newVersionTech.split(',').map(t => t.trim()) : this.project.technologies
    };

    this.versionService.createVersion(this.projectId, payload).subscribe({
      next: (res) => {
        this.toast.success(`Version ${res.data.versionNumber} created!`);
        this.showNewVersionModal = false;
        this.project.currentVersion = res.data.versionNumber;
        this.loadProject();
        this.loadVersions();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create new version');
      }
    });
  }

  // Traceability Tab
  loadTraceability() {
    this.traceabilityService.getTraceabilityMatrix(this.projectId).subscribe({
      next: (res) => {
        this.traceabilityMatrix = res.data.matrix;
      }
    });
  }

  submitRequirement() {
    this.traceabilityService.createRequirement(this.projectId, {
      title: this.newReqTitle,
      description: this.newReqDesc,
      priority: this.newReqPriority
    }).subscribe({
      next: () => {
        this.toast.success('Requirement added');
        this.showNewReqModal = false;
        this.newReqTitle = '';
        this.newReqDesc = '';
        this.loadTraceability();
      },
      error: () => this.toast.error('Failed to create requirement')
    });
  }

  deleteRequirement(id: string) {
    if (!confirm('Are you sure you want to delete this requirement and attached artifacts?')) return;
    this.traceabilityService.deleteRequirement(id).subscribe({
      next: () => {
        this.toast.success('Requirement deleted');
        this.loadTraceability();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete requirement')
    });
  }

  openAddFeatureModal(reqId: string) {
    this.selectedReqId = reqId;
    this.newFeatTitle = '';
    this.newFeatDesc = '';
    this.newFeatComplexity = 'medium';
    this.showNewFeatModal = true;
  }

  submitFeature() {
    if (!this.newFeatTitle.trim()) return;
    this.traceabilityService.createFeature(this.projectId, {
      requirementId: this.selectedReqId,
      title: this.newFeatTitle.trim(),
      description: this.newFeatDesc.trim(),
      complexity: this.newFeatComplexity
    }).subscribe({
      next: () => {
        this.toast.success('Feature created successfully');
        this.showNewFeatModal = false;
        this.loadTraceability();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to create feature')
    });
  }

  deleteFeature(id: string) {
    if (!confirm('Are you sure you want to delete this feature and associated test cases/issues?')) return;
    this.traceabilityService.deleteFeature(id).subscribe({
      next: () => {
        this.toast.success('Feature deleted');
        this.loadTraceability();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete feature')
    });
  }

  openAddTestCaseModal(featId: string, reqId: string) {
    this.selectedFeatId = featId;
    this.selectedReqId = reqId;
    this.newTcTitle = '';
    this.newTcDesc = '';
    this.newTcExpected = '';
    this.showNewTcModal = true;
  }

  submitTestCase() {
    if (!this.newTcTitle.trim() || !this.newTcExpected.trim()) return;
    this.traceabilityService.createTestCase(this.projectId, {
      featureId: this.selectedFeatId,
      requirementId: this.selectedReqId,
      title: this.newTcTitle.trim(),
      description: this.newTcDesc.trim(),
      expectedResult: this.newTcExpected.trim()
    }).subscribe({
      next: () => {
        this.toast.success('Test Case added successfully');
        this.showNewTcModal = false;
        this.loadTraceability();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to create test case')
    });
  }

  deleteTestCase(id: string) {
    if (!confirm('Are you sure you want to delete this test case?')) return;
    this.traceabilityService.deleteTestCase(id).subscribe({
      next: () => {
        this.toast.success('Test Case deleted');
        this.loadTraceability();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete test case')
    });
  }

  openAddIssueModal(featId: string, reqId: string, tcId?: string) {
    this.selectedFeatId = featId;
    this.selectedReqId = reqId;
    this.selectedTcId = tcId || '';
    this.newIssueTitle = '';
    this.newIssueDesc = '';
    this.newIssueSeverity = 'major';
    this.showNewIssueModal = true;
  }

  submitIssue() {
    if (!this.newIssueTitle.trim()) return;
    this.traceabilityService.createIssue(this.projectId, {
      featureId: this.selectedFeatId,
      requirementId: this.selectedReqId,
      testCaseId: this.selectedTcId || undefined,
      title: this.newIssueTitle.trim(),
      description: this.newIssueDesc.trim() || this.newIssueTitle.trim(),
      severity: this.newIssueSeverity
    }).subscribe({
      next: () => {
        this.toast.success('Issue recorded successfully');
        this.showNewIssueModal = false;
        this.loadTraceability();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to create issue')
    });
  }

  deleteIssue(id: string) {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    this.traceabilityService.deleteIssue(id).subscribe({
      next: () => {
        this.toast.success('Issue deleted');
        this.loadTraceability();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete issue')
    });
  }

  // Reviews Tab
  loadReviews() {
    this.reviewService.getProjectReviews(this.projectId).subscribe({
      next: (res) => {
        this.reviews = res.data.reviews;
        this.comments = res.data.comments;
      }
    });
  }

  submitFacultyReview() {
    this.reviewService.submitReview(this.projectId, {
      statusDecision: this.reviewDecision,
      comments: this.reviewComments,
      criteriaRatings: this.rubric
    }).subscribe({
      next: (res) => {
        this.toast.success('Official review recorded!');
        this.project.status = res.data.statusDecision as any;
        this.reviewComments = '';
        this.loadReviews();
        this.loadProject();
      },
      error: (err) => this.toast.error(err.error?.message || 'Review submission failed')
    });
  }

  addDiscussionComment() {
    if (!this.newCommentContent.trim()) return;
    this.reviewService.addComment(this.projectId, this.newCommentContent).subscribe({
      next: (res) => {
        this.comments.push(res.data);
        this.newCommentContent = '';
      },
      error: () => this.toast.error('Failed to post comment')
    });
  }
}
