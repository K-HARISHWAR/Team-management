import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import PouchDB from 'pouchdb-browser';

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

  constructor(private fb: FormBuilder, private router: Router) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['user', Validators.required],
      team: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.memberForm.invalid) {
      return;
    }

    const formValue = this.memberForm.value;
    const doc = {
      _id: 'user:' + formValue.email,
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role,
      team: formValue.team,
      createdAt: new Date().toISOString()
    };

    try {
      await this.userDb.put(doc);
      this.message = 'Member created successfully!';
      this.error = '';
      this.memberForm.reset();
      setTimeout(() => this.router.navigate(['/admin']), 1500);
    } catch (err: any) {
      console.error(err);
      this.error = 'Failed to create member: ' + (err.reason || err.message);
      this.message = '';
    }
  }
}
