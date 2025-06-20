import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import PouchDB from 'pouchdb-browser';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-create-member',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-member.component.html',
  styleUrls: ['./create-member.component.css']
})
export class CreateMemberComponent {
  memberForm: FormGroup;
  userDb = new PouchDB('http://Harishwar:harish22@localhost:5984/users');
  message = '';
  error = '';
  passwordStrength: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | '' = '';
  teams: string[] = [];

  constructor(private fb: FormBuilder, private router: Router, private teamService: TeamService) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.com$')]],
      password: ['', [Validators.required,Validators.minLength(6)]],
      role: ['', Validators.required],
      team: ['']
    });

    this.memberForm.get('password')?.valueChanges.subscribe(value => {
      this.evaluatePasswordStrength(value);
    });
    this.memberForm.get('role')?.valueChanges.subscribe(role => {
  const teamControl = this.memberForm.get('team');
  if (role === 'user') {
    teamControl?.setValidators(Validators.required);
  } else {
    teamControl?.clearValidators();
    teamControl?.setValue('');
  }
  teamControl?.updateValueAndValidity();
});
    this.loadTeams();
  }

  async loadTeams() {
    try {
      const result = await this.userDb.allDocs({ include_docs: true });
      const dbTeams = result.rows
        .filter(row => row.doc && row.doc._id.startsWith('user:') && (row.doc as any).team)
        .map(row => (row.doc as any).team);

      const localTeams = this.teamService.getTeams();
      const mergedTeams = Array.from(new Set([...dbTeams, ...localTeams]));
      this.teams = mergedTeams;
    } catch (err) {
      console.error('Failed to load teams:', err);
      this.teams = this.teamService.getTeams(); 
    }
  }

  evaluatePasswordStrength(password: string): void {
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    this.passwordStrength =
      score === 1 ? 'Very Weak' :
      score === 2 ? 'Weak' :
      score === 3 ? 'Medium' :
      score === 4 ? 'Strong' : '';
  }

  get isFormValid(): boolean {
    return this.memberForm.valid && (this.passwordStrength === 'Medium' || this.passwordStrength === 'Strong');
  }

  getBarWidth(): string {
    const widths: { [key: string]: string } = {
      'Very Weak': '25%',
      'Weak': '50%',
      'Medium': '75%',
      'Strong': '100%'
    };
    return widths[this.passwordStrength] ?? '0%';
  }

  getBarColor(): string {
    const colors: { [key: string]: string } = {
      'Very Weak': '#d32f2f',
      'Weak': '#f57c00',
      'Medium': '#fbc02d',
      'Strong': '#388e3c'
    };
    return colors[this.passwordStrength] ?? '#ccc';
  }

  async onSubmit() {
    if (!this.isFormValid) return;

    const formValue = this.memberForm.value;
    const doc:any = {
      _id: 'user:' + formValue.email,
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    if (formValue.role === 'user') {
    doc.team = formValue.team;
    }
    try {
      await this.userDb.put(doc);
      this.message = 'Member created successfully!';
      this.error = '';
      this.memberForm.reset();
      this.passwordStrength = '';
    } catch (err: any) {
      this.error = 'Failed to create member: ' + (err.reason || err.message);
      this.message = '';
    }
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  get name() { return this.memberForm.get('name'); }
  get email() { return this.memberForm.get('email'); }
  get password() { return this.memberForm.get('password'); }
  get role() { return this.memberForm.get('role'); }
  get team() { return this.memberForm.get('team'); }
}
