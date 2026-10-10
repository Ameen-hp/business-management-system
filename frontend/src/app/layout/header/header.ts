import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class AdminHeader {
  @Output() sidebarToggle = new EventEmitter<void>();

  sidebarOpen = false;
  profileOpen = false;
  notificationsOpen = false;

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarToggle.emit();
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    this.notificationsOpen = false;
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.profileOpen = false;
  }

  logout(): void {
    // Connect this to your authentication service when available.
    // Do not treat client-side navigation alone as secure logout.
    this.profileOpen = false;
    this.router.navigate(['/login']);
  }
}
