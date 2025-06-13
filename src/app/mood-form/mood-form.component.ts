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
  name: string = '';
  team: string = '';
  isSubmitting = false;
  moodOptions = ['😊 Happy', '😐 Neutral', '😔 Sad', '😡 Angry', '😴 Sleepy'];

  constructor(
    private fb: FormBuilder,
    private moodService: MoodService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.name = localStorage.getItem('name') || '';
    this.team = localStorage.getItem('team') || '';

    this.moodForm = this.fb.group({
      mood: ['', Validators.required],
      note: [''],
      dayRating: [null, [Validators.required,Validators.min(1),Validators.max(5)]],
      date: [new Date().toISOString().slice(0, 10), Validators.required]
    });
  }

  submitMood(): void {
    if (this.moodForm.invalid) return;

    const { mood, note, dayRating, date } = this.moodForm.value;
    const entry = {
      _id:`${this.name}_${this.team}_${date}`,
      mood,
      note,
      dayRating:Number(dayRating),
      date,
      name: this.name,
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
