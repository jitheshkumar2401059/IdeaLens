import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="form-page-container">
      <div class="form-header">
        <div>
          <h2>{{ isEditMode ? 'Edit Project Idea' : 'Propose New Project Idea' }}</h2>
          <p>Define your core technical concept for AI novelty analysis and faculty evaluation</p>
        </div>
        <a routerLink="/projects" class="btn btn-secondary">
          ← Back to Projects
        </a>
      </div>

      <div class="glass-panel form-card">
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="project-form">
          <!-- Title -->
          <div class="form-group">
            <label for="title">Project Title *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="e.g. Autonomous Urban Traffic Signal Optimization via Deep Reinforcement Learning"
              [class.input-error]="isFieldInvalid('title')"
            />
            <div class="error-msg" *ngIf="isFieldInvalid('title')">
              Project title is required (maximum 200 characters)
            </div>
          </div>

          <!-- Domain & Target Users -->
          <div class="form-row">
            <div class="form-group">
              <label for="domain">Project Domain *</label>
              <select id="domain" formControlName="domain" [class.input-error]="isFieldInvalid('domain')">
                <option value="">Select Domain Vertical...</option>
                <option *ngFor="let d of domains" [value]="d">{{ d }}</option>
              </select>
              <div class="error-msg" *ngIf="isFieldInvalid('domain')">
                Please select a domain
              </div>
            </div>

            <div class="form-group">
              <label for="targetUsers">Target Users & Stakeholders *</label>
              <input
                id="targetUsers"
                type="text"
                formControlName="targetUsers"
                placeholder="e.g. Municipal traffic controllers, emergency ambulance dispatchers"
                [class.input-error]="isFieldInvalid('targetUsers')"
              />
              <div class="error-msg" *ngIf="isFieldInvalid('targetUsers')">
                Target users must be specified
              </div>
            </div>
          </div>

          <!-- Problem Statement -->
          <div class="form-group">
            <div class="label-with-tip">
              <label for="problemStatement">Problem Statement *</label>
              <span class="hint-tip">Describe the current inefficiency, urgency, and gap</span>
            </div>
            <textarea
              id="problemStatement"
              rows="4"
              formControlName="problemStatement"
              placeholder="What exact real-world problem or research gap are you solving? Who does it affect and why are existing approaches insufficient?"
              [class.input-error]="isFieldInvalid('problemStatement')"
            ></textarea>
            <div class="error-msg" *ngIf="isFieldInvalid('problemStatement')">
              Problem statement is required
            </div>
          </div>

          <!-- Proposed Solution -->
          <div class="form-group">
            <div class="label-with-tip">
              <label for="proposedSolution">Proposed Technical Solution *</label>
              <span class="hint-tip">Explain your architectural approach and differentiator</span>
            </div>
            <textarea
              id="proposedSolution"
              rows="4"
              formControlName="proposedSolution"
              placeholder="Explain how your system technically solves this problem. Detail the workflow, algorithms, data pipeline, or specialized hardware involved."
              [class.input-error]="isFieldInvalid('proposedSolution')"
            ></textarea>
            <div class="error-msg" *ngIf="isFieldInvalid('proposedSolution')">
              Proposed solution is required
            </div>
          </div>

          <!-- Technologies & Key Features -->
          <div class="form-row">
            <div class="form-group">
              <label for="technologies">Technologies (comma-separated) *</label>
              <input
                id="technologies"
                type="text"
                formControlName="technologies"
                placeholder="e.g. Python, PyTorch, Angular, Node.js, WebSockets, OpenCV"
                [class.input-error]="isFieldInvalid('technologies')"
              />
              <span class="input-subtext">Used by the similarity engine to calculate technology match score.</span>
              <div class="error-msg" *ngIf="isFieldInvalid('technologies')">
                At least one technology is required
              </div>
            </div>

            <div class="form-group">
              <label for="keyFeatures">Key Features (comma-separated or semicolons) *</label>
              <input
                id="keyFeatures"
                type="text"
                formControlName="keyFeatures"
                placeholder="e.g. Real-time queue counting, Dynamic phase allocation, Emergency corridor dispatch"
                [class.input-error]="isFieldInvalid('keyFeatures')"
              />
              <span class="input-subtext">Key capabilities of your system.</span>
              <div class="error-msg" *ngIf="isFieldInvalid('keyFeatures')">
                At least one key feature is required
              </div>
            </div>
          </div>

          <!-- Expected Outcome -->
          <div class="form-group">
            <label for="expectedOutcome">Expected Outcome & Deliverables *</label>
            <textarea
              id="expectedOutcome"
              rows="2"
              formControlName="expectedOutcome"
              placeholder="e.g. A functional web platform reducing peak junction wait times by 20% tested on live CCTV feeds."
              [class.input-error]="isFieldInvalid('expectedOutcome')"
            ></textarea>
            <div class="error-msg" *ngIf="isFieldInvalid('expectedOutcome')">
              Expected outcome is required
            </div>
          </div>

          <!-- Optional References -->
          <div class="form-group">
            <label for="references">Academic & Technical References (optional)</label>
            <input
              id="references"
              type="text"
              formControlName="references"
              placeholder="e.g. IEEE Transactions paper, GitHub repo, whitepaper URL"
            />
          </div>

          <div class="form-actions">
            <button type="button" routerLink="/projects" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="projectForm.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="animate-spin">⏳</span>
              <span>{{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Project Idea' : 'Propose Idea & Create v1') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page-container {
      padding: 32px 24px;
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-header h2 {
      font-size: 1.75rem;
      margin-bottom: 4px;
    }

    .form-card {
      padding: 32px;
      border: 1px solid var(--border-subtle);
    }

    .project-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 680px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label-with-tip {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .hint-tip {
      font-size: 0.75rem;
      color: var(--primary-400);
    }

    .input-subtext {
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    .input-error {
      border-color: var(--accent-rose) !important;
    }

    .error-msg {
      font-size: 0.75rem;
      color: var(--accent-rose);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: string | null = null;
  isSubmitting = false;

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
    'Agriculture',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      domain: ['', Validators.required],
      targetUsers: ['', Validators.required],
      problemStatement: ['', Validators.required],
      proposedSolution: ['', Validators.required],
      technologies: ['', Validators.required],
      keyFeatures: ['', Validators.required],
      expectedOutcome: ['', Validators.required],
      references: ['']
    });
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.isEditMode = true;
      this.loadExistingProject(this.projectId);
    }
  }

  loadExistingProject(id: string) {
    this.projectService.getProjectById(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.projectForm.patchValue({
          title: p.title,
          domain: p.domain,
          targetUsers: p.targetUsers,
          problemStatement: p.problemStatement,
          proposedSolution: p.proposedSolution,
          technologies: (p.technologies || []).join(', '),
          keyFeatures: (p.keyFeatures || []).join(', '),
          expectedOutcome: p.expectedOutcome,
          references: (p.references || []).join(', ')
        });
      },
      error: () => {
        this.toast.error('Could not load project for editing');
        this.router.navigate(['/projects']);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.projectForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.projectForm.invalid) return;

    this.isSubmitting = true;
    const formVal = this.projectForm.value;

    const payload = {
      ...formVal,
      technologies: formVal.technologies.split(',').map((t: string) => t.trim()).filter(Boolean),
      keyFeatures: formVal.keyFeatures.split(',').map((f: string) => f.trim()).filter(Boolean),
      references: formVal.references ? formVal.references.split(',').map((r: string) => r.trim()).filter(Boolean) : []
    };

    if (this.isEditMode && this.projectId) {
      this.projectService.updateProject(this.projectId, payload).pipe(
        finalize(() => { this.isSubmitting = false; })
      ).subscribe({
        next: (res) => {
          this.toast.success('Project idea updated successfully');
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Update failed');
        }
      });
    } else {
      this.projectService.createProject(payload).pipe(
        finalize(() => { this.isSubmitting = false; })
      ).subscribe({
        next: (res) => {
          this.toast.success('Project idea created with Version 1!');
          this.router.navigate(['/projects', res.data._id]);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Creation failed');
        }
      });
    }
  }
}
