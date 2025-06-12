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
  constructor(private router:Router){}
  users: any[] = [];
  teams: string[] = [];
  selectedTeam: string | null = null;
  loading = false;
  errorMessage = '';

  private userDb = new PouchDB('http://Harishwar:harish22@localhost:5984/users');

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
}
