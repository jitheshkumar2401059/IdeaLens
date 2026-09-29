import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface NotificationItem {
  _id: string;
  recipientId: string;
  senderId?: { _id: string; name: string; role: string };
  projectId?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5001/api/notifications';

  notifications = signal<NotificationItem[]>([]);
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  fetchNotifications(): Observable<{ success: boolean; unreadCount: number; data: NotificationItem[] }> {
    return this.http.get<{ success: boolean; unreadCount: number; data: NotificationItem[] }>(this.apiUrl).pipe(
      tap(res => {
        if (res.success) {
          this.notifications.set(res.data);
          this.unreadCount.set(res.unreadCount);
        }
      })
    );
  }

  markAsRead(id: string): Observable<{ success: boolean; data: NotificationItem }> {
    return this.http.patch<{ success: boolean; data: NotificationItem }>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(list =>
          list.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  markAllAsRead(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      })
    );
  }
}
