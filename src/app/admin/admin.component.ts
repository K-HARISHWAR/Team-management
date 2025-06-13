import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import PouchDB from 'pouchdb-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  teams: string[] = [];
  selectedTeam: string | null = null;
  loading = false;
  errorMessage = '';

  private userDb = new PouchDB('http://Harishwar:harish22@localhost:5984/users');

  constructor(public router: Router) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const result = await this.userDb.allDocs({ include_docs: true });
      this.users = result.rows
        .filter(row => !!row.doc && row.doc._id.startsWith('user:'))
        .map(row => row.doc!);

      const teamSet = new Set(this.users.map(user => user.team).filter(Boolean));
      this.teams = Array.from(teamSet);
    } catch (error: any) {
      this.errorMessage = 'Failed to fetch users: ' + (error.message || 'Unknown error');
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  getTeamMembers(team: string): any[] {
    return this.users.filter(user => user.team === team);
  }

  selectTeam(team: string) {
    this.selectedTeam = team;
  }

  clearSelection() {
    this.selectedTeam = null;
  }

  navigateToCreateMember() {
    this.router.navigate(['/create-member']);
  }

  logout() {
    this.router.navigate(['']);
  }

  async deleteUser(user: any) {
    try {
      const doc = await this.userDb.get(user._id);
      await this.userDb.remove(doc);
      this.users = this.users.filter(u => u._id !== user._id);
      console.log(`User ${user.name} deleted.`);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }
}
