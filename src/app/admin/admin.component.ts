import { TeamService } from './../services/team.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import PouchDB from 'pouchdb-browser';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  teams: string[] = [];
  selectedTeam: string | null = null;
  loading = false;
  errorMessage = '';
  newTeamName: string = '';

  private userDb = new PouchDB('http://Harishwar:harish22@localhost:5984/users');

  constructor(public router: Router, private teamService: TeamService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const result = await this.userDb.allDocs({ include_docs: true });
      this.users = result.rows
        .filter(row => !!row.doc && row.doc._id.startsWith('user:'))
        .map(row => row.doc!);

      const dbTeams = this.users.map(user => user.team).filter(Boolean);
      const localTeams = this.teamService.getTeams();
      const merged = Array.from(new Set([...dbTeams, ...localTeams]));
      this.teams = merged;
    } catch (error: any) {
      this.errorMessage = 'Failed to fetch users: ' + (error.message || 'Unknown error');
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  addTeam() {
    const trimmed = this.newTeamName.trim();
    if (!trimmed || this.teams.includes(trimmed)) return;
    this.teamService.addTeam(trimmed); 
    this.teams.push(trimmed);
    this.newTeamName = '';
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

  async deleteUser(user: any) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete user "${user.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      try {
        const doc = await this.userDb.get(user._id);
        await this.userDb.remove(doc);
        this.users = this.users.filter(u => u._id !== user._id);
        Swal.fire('Deleted!', `User "${user.name}" has been deleted.`, 'success');
      } catch (err) {
        console.error('Delete failed:', err);
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    }
  }

  navigateToUserMood(userName: string) {
    this.router.navigate(['/mood-trend'], {
      queryParams: { user: encodeURIComponent(userName), from: 'admin' }
    });
  }

  navigateToTeamMood(teamName: string) {
    this.router.navigate(['/team-mood', encodeURIComponent(teamName)]);
  }

  logout() {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout'
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['']);
        Swal.fire('Logged out!', '', 'success');
      }
    });
  }

  async deleteTeam(team: string) {
    const result = await Swal.fire({
      title: `Delete "${team}" team?`,
      text: 'This will delete all users in this team from CouchDB and their respective mood Documents. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete team',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const result = await this.userDb.allDocs<{team:string}>({ include_docs: true });
      const usersToDelete = result.rows
        .filter(row => row.doc && row.doc.team === team)
        .map(row => ({
          ...row.doc,
          _deleted: true
        }));

      if (usersToDelete.length > 0) {
        await this.userDb.bulkDocs(usersToDelete);
        this.users = this.users.filter(u => u.team !== team);
      }

      this.teams = this.teams.filter(t => t !== team);
      this.teamService.removeTeam(team);

      Swal.fire('Deleted!', `"${team}" team and its ${usersToDelete.length} members have been deleted.`, 'success');
    } catch (err) {
      console.error('Error deleting team and members:', err);
      Swal.fire('Error', 'Failed to delete team members.', 'error');
    }
  }
}
