import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private storageKey = 'teamList';

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  getTeams(): string[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  addTeam(team: string): void {
    const current = this.getTeams();
    if (!current.includes(team)) {
      current.push(team);
      localStorage.setItem(this.storageKey, JSON.stringify(current));
    }
  }

  clearTeams(): void {
    localStorage.removeItem(this.storageKey);
  }

  removeTeam(team: string) {
  const current = this.getTeams();
  const updated = current.filter(t => t !== team);
  localStorage.setItem(this.storageKey, JSON.stringify(updated));
}

}
