import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  setUserSession(user: { name: string; role: string; team: string }) {
    localStorage.setItem('name', user.name);
    localStorage.setItem('role', user.role);
    localStorage.setItem('team', user.team);
  }

  get name(): string {
    return localStorage.getItem('name') || '';
  }

  get role(): string {
    return localStorage.getItem('role') || '';
  }

  get team(): string {
    return localStorage.getItem('team') || '';
  }

  clear() {
    localStorage.clear();
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('username');
  }
}
