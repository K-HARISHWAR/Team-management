import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MoodService } from '../services/mood.service';

@Component({
  selector: 'app-mood-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mood-form.component.html',
  styleUrls: ['./mood-form.component.css']
})
export class MoodFormComponent implements OnInit {
  moodForm!: FormGroup;
  username: string = '';
  team: string = '';
  isSubmitting = false;
  moodOptions = ['😊', '😐', '😔', '😡', '😴'];

  constructor(
    private fb: FormBuilder,
    private moodService: MoodService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('name') || '';
    this.team = localStorage.getItem('team') || '';

    this.moodForm = this.fb.group({
      mood: ['', Validators.required],
      note: [''],
      dayRating: ['', Validators.required],
      date: [new Date().toISOString().slice(0, 10), Validators.required]
    });
  }

  submitMood(): void {
    if (this.moodForm.invalid) return;

    const { mood, note, dayRating, date } = this.moodForm.value;
    const entry = {
      _id:`${this.username}_${this.team}_${date}`,
      mood,
      note,
      dayRating,
      date,
      username: this.username,
      team: this.team
    };

    this.isSubmitting = true;
    this.moodService.saveMoodEntry(entry).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error('Error saving mood entry:', err);
        this.isSubmitting = false;
      }
    });
  }
}
