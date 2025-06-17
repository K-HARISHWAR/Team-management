import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import PouchDB from 'pouchdb-browser';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  Swal.fire({
    title: 'Logout Confirmation',
    text: 'Are you sure you want to log out?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#4caf50',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['']);
      Swal.fire('Logged out!', 'You have been successfully logged out.', 'success');
    }
  });
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

  navigateToUserMood(userName: string) {
  const encoded = encodeURIComponent(userName);
  this.router.navigate(['/view-mood', encoded]);
}

navigateToTeamMood(teamName: string) {
  const encoded = encodeURIComponent(teamName);
  this.router.navigate(['/team-mood', encoded]);
}
}
