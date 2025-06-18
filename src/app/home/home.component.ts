import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { MoodService } from '../services/mood.service';
import { SessionService } from '../services/session.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  moodOptions = [
  { emoji: '😊 Happy', label: '' },
  { emoji: '😐 Neutral', label: '' },
  { emoji: '😔 Sad', label: '' },
  { emoji: '😡 Angry', label: '' },
  { emoji: '😴 Sleepy', label: '' }
]
  isDarkMode = false;
  name = '';
  team = '';
  greeting = '';
  activeTab: 'form' | 'list' = 'form';
  streakCount = 0;
  totalEntries = 0;
  mostFrequentMood = '';
  recentMoods: any[] = [];

  showModal = false;
  editingEntry: any = {};

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private moodService: MoodService,
    private sessionService: SessionService
  ) {
    this.themeService.darkMode$.subscribe(mode => (this.isDarkMode = mode));
  }

  ngOnInit(): void {
    if (this.sessionService.role !== 'user') {
      this.router.navigate(['/']);
      return;
    }

    this.name = this.sessionService.name;
    this.team = this.sessionService.team;

    this.setGreeting();
    this.loadStreak();
    this.loadStats();
    this.loadRecentMoods();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  logout(): void {
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
        this.sessionService.clear();
        this.router.navigate(['/']);
        Swal.fire('Logged out!', 'You have been successfully logged out.', 'success');
      }
    });
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  }

  loadStreak(): void {
    this.moodService.getUserMoodDates(this.name).subscribe(dates => {
      this.streakCount = this.getCurrentStreak(dates);
    });
  }

  getCurrentStreak(dates: string[]): number {
    const dateSet = new Set(dates);
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 100; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const formatted = checkDate.toISOString().slice(0, 10);
      if (dateSet.has(formatted)) streak++;
      else break;
    }

    return streak;
  }

  loadStats(): void {
    this.moodService.getUserMoodStats(this.name).subscribe(stats => {
      this.totalEntries = stats.total - 1 || 0;
      this.mostFrequentMood = stats.frequentMood || 'N/A';
    });
  }

  loadRecentMoods(): void {
    this.moodService.getRecentMoods(this.name).subscribe({
      next: moods => {
        const todayStr = new Date().toISOString().split('T')[0];
        const yday = new Date();
        yday.setDate(yday.getDate() - 1);
        const ydayStr = yday.toISOString().split('T')[0];

        this.recentMoods = moods.slice(0, 3).map(m => ({
          ...m,
          isEditable: m.date === todayStr || m.date === ydayStr
        }));
      },
      error: err => console.error('Error loading recent moods:', err)
    });
  }

  openEditModal(entry: any) {
    this.editingEntry = { ...entry };
    this.showModal = true;
  }

  saveEdit() {
    if (!this.editingEntry._id || !this.editingEntry._rev) return;

    const updatedDoc = {
      _id: this.editingEntry._id,
      _rev: this.editingEntry._rev,
      mood: this.editingEntry.mood,
      note: this.editingEntry.note,
      dayRating: Number(this.editingEntry.dayRating),
      date: this.editingEntry.date,
      name: this.name,
      team: this.team
    };

    this.moodService.updateMoodEntry(updatedDoc).subscribe({
      next: res => {
        this.showModal = false;
        this.loadRecentMoods();
        Swal.fire('Saved!', 'Mood updated successfully.', 'success');
      },
      error: () => {
        Swal.fire('Error!', 'Failed to update mood entry.', 'error');
      }
    });
  }

  goToMoodForm() {
    this.router.navigate(['mood-form']);
  }

  goToMoodTrend() {
    this.router.navigate(['/mood-trend']);
  }

  goToMoodView(): void {
    this.router.navigate(['/mood-view']);
  }
}
