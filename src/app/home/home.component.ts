import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { MoodService } from '../services/mood.service';
import { SessionService } from '../services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isDarkMode = false;
  name = '';
  team = '';
  greeting = '';
  activeTab: 'form' | 'list' = 'form';
  streakCount = 0;
  totalEntries = 0;
  mostFrequentMood = '';
  recentMoods: { mood: string; note: string; date: string }[] = [];

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


  setTab(tab: 'form' | 'list'): void {
    this.activeTab = tab;
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
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
      if (dateSet.has(formatted)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  loadStats(): void {
    this.moodService.getUserMoodStats(this.name).subscribe(stats => {
      this.totalEntries = stats.total-1 || 0;
      this.mostFrequentMood = stats.frequentMood || 'N/A';
    });
  }

  loadRecentMoods(): void {
    this.moodService.getRecentMoods(this.name).subscribe({
      next: moods => {
        this.recentMoods = moods.slice(0, 3);
      },
      error: err => console.error('Error loading recent moods:', err)
    });
  }

  goToMoodForm() {
    this.router.navigate(['mood-form']);
  }

  goToMoodTrend(){
    this.router.navigate(['/mood-trend']);
  }
}
