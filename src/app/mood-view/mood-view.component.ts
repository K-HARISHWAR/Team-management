import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MoodService } from '../services/mood.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mood-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './mood-view.component.html',
  styleUrls: ['./mood-view.component.css']
})
export class MoodViewComponent implements OnInit {
  allMoods: any[] = [];
  filteredMoods: any[] = [];

  now = new Date();
  monthFilter = new FormControl('');
  yearFilter = new FormControl('');

  months = [
    { label: 'Jan', value: '01' }, { label: 'Feb', value: '02' },
    { label: 'Mar', value: '03' }, { label: 'Apr', value: '04' },
    { label: 'May', value: '05' }, { label: 'Jun', value: '06' },
    { label: 'Jul', value: '07' }, { label: 'Aug', value: '08' },
    { label: 'Sep', value: '09' }, { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' }
  ];

  years: string[] = [];

  constructor(private moodService: MoodService, private router: Router) {}

  ngOnInit(): void {
    this.generateYears();
    this.loadUserMoods();
    this.setupFilters();
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 28 }, (_, i) => (currentYear - i).toString());
  }

  loadUserMoods(): void {
    const name = localStorage.getItem('name');
    if (!name) return;

    this.moodService.getMoodsByName(name).subscribe((res: any) => {
      this.allMoods = res.docs;
      this.applyFilters();
    });
  }

  setupFilters(): void {
    this.monthFilter.valueChanges.subscribe(() => this.applyFilters());
    this.yearFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const selectedMonth = this.monthFilter.value;
    const selectedYear = this.yearFilter.value;

    this.filteredMoods = this.allMoods.filter(mood => {
      const [year, month] = mood.date.split('-');
      const matchMonth = selectedMonth ? month === selectedMonth : true;
      const matchYear = selectedYear ? year === selectedYear : true;
      return matchMonth && matchYear;
    });

    this.filteredMoods.sort((a, b) => b.date.localeCompare(a.date)); 
  }

  goBack(): void {
    this.router.navigate(['home']);
  }
}
