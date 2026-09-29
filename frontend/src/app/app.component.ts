import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, ToastComponent],
  template: `
    <div class="app-layout">
      <app-toast></app-toast>
      <app-navbar (toggleSidebar)="isSidebarOpen = !isSidebarOpen"></app-navbar>

      <div class="main-body" [class.no-auth]="!authService.isAuthenticated()">
        <app-sidebar
          *ngIf="authService.isAuthenticated()"
          [isOpen]="isSidebarOpen"
          (close)="isSidebarOpen = false"
        ></app-sidebar>

        <main class="page-content" [class.full-width]="!authService.isAuthenticated()">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-primary);
    }

    .main-body {
      display: flex;
      flex: 1;
      position: relative;
    }

    .main-body.no-auth {
      display: block;
    }

    .page-content {
      flex: 1;
      width: calc(100% - var(--sidebar-width));
      min-height: calc(100vh - var(--navbar-height));
      overflow-y: auto;
    }

    .page-content.full-width {
      width: 100%;
    }

    @media (max-width: 900px) {
      .page-content {
        width: 100%;
      }
    }
  `]
})
export class AppComponent {
  isSidebarOpen = false;

  constructor(public authService: AuthService) {}
}
