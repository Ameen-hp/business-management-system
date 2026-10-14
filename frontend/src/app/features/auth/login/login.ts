import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  loginId = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private router: Router) {}

  login(): void {
    this.error = '';

    const loginId = this.loginId.trim().toLowerCase();
    const password = this.password;

    if (!loginId || !password) {
      this.error = 'Please enter your login ID and password.';
      return;
    }

    // Temporary dummy Admin login
    if (loginId === 'admin@test.com' && password === 'Admin@123') {
      sessionStorage.setItem('userId', '1');
      sessionStorage.setItem('fullName', 'Test Admin');
      sessionStorage.setItem('role', 'ADMIN');
      sessionStorage.setItem('accessToken', 'dummy-test-token');
      sessionStorage.removeItem('customerId');

      this.router.navigate(['/admin/dashboard']);
      return;
    }

    // Temporary dummy Customer login
    if (loginId === 'muhammad@gmail.com' && password === 'muhammad123') {
      sessionStorage.setItem('userId', '3');
      sessionStorage.setItem('customerId', '3');
      sessionStorage.setItem('fullName', 'Muhammad');
      sessionStorage.setItem('role', 'CUSTOMER');
      sessionStorage.setItem('accessToken', 'dummy-test-token');

      this.router.navigate(['/customer/catalog']);
      return;
    }

    this.error = 'Invalid login ID or password.';
  }

  // Keep this method if your HTML currently calls submit().
  submit(): void {
    this.login();
  }
}
