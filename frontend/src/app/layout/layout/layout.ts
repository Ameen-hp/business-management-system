import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeader } from '../header/header';
import { AdminSidebar } from '../sidebar/sidbar';
import { AdminFooter } from '../footer/footer';
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminHeader, AdminSidebar, AdminFooter],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class AdminLayout {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
