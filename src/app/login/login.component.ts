import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { SessionService } from '@services/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  async onLogin() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const user = await this.authService.login(this.email, this.password);
      console.log('Logged in User:', user);

      this.sessionService.setUserSession(user);

      if (user.role === 'user') {
        this.router.navigate(['/home']);
      } else if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
