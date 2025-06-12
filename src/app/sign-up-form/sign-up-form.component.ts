import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import PouchDB from 'pouchdb-browser';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignupFormComponent {
  name = '';
  email = '';
  password = '';
  role = 'member'; 
  team = '';
  message = '';
  errorMessage = '';
  loading = false;

  private userDb = new PouchDB('http://localhost:5984/users');

  async onSignup() {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    const userId = `user:${this.email}`;

    try {
      const existing = await this.userDb.get(userId).catch(() => null);
      if (existing) {
        this.errorMessage = 'User already exists!';
        this.loading = false;
        return;
      }

      const newUser = {
        _id: userId,
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        team: this.team,
        createdAt: new Date().toISOString()
      };

      await this.userDb.put(newUser);

      this.message = `User ${this.name} created successfully!`;
      this.name = '';
      this.email = '';
      this.password = '';
      this.team = '';
      this.role = 'member';
    } catch (error: any) {
      this.errorMessage = 'Error creating user: ' + (error.message || 'Unknown error');
    } finally {
      this.loading = false;
    }
  }
}
