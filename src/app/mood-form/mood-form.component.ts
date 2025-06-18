import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MoodService } from '../services/mood.service';
import Swal from 'sweetalert2';

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
  today: string = new Date().toISOString().slice(0, 10);

  constructor(
    private fb: FormBuilder,
    private moodService: MoodService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.name = localStorage.getItem('name') || '';
    this.team = localStorage.getItem('team') || '';
    this.today = new Date().toISOString().slice(0, 10);

    this.moodForm = this.fb.group({
      mood: ['', Validators.required],
      note: [''],
      dayRating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      date: [this.today, Validators.required]
    });
  }

  submitMood(): void {
    if (this.moodForm.invalid) return;

    const { mood, note, dayRating, date } = this.moodForm.value;
    const entry = {
      _id: `${this.name}_${this.team}_${date}`,
      mood,
      note,
      dayRating: Number(dayRating),
      date,
      name: this.name,
      team: this.team
    };

    this.isSubmitting = true;
    this.moodService.saveMoodEntry(entry).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          title: 'Success 🎉',
          text: 'Your mood has been saved!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      error: err => {
        this.isSubmitting = false;
        if (err.status === 409) {
          Swal.fire({
            title: 'Duplicate Entry ❗',
            text: 'You have already submitted a mood for today.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to save your mood. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error('Error saving mood entry:', err);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
