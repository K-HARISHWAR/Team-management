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
  groupedMoods: { [key: string]: any[] } = {};
  collapsibleStates: { [key: string]: boolean } = {};

  now = new Date();
  monthFilter = new FormControl(this.now.toISOString().slice(5, 7)); 
  yearFilter = new FormControl(this.now.getFullYear().toString());  

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

    const filtered = this.allMoods.filter(mood => {
      const [year, month] = mood.date.split('-');
      const matchMonth = selectedMonth ? month === selectedMonth : true;
      const matchYear = selectedYear ? year === selectedYear : true;
      return matchMonth && matchYear;
    });

    this.groupByMonth(filtered);
  }

  groupByMonth(moods: any[]): void {
    this.groupedMoods = {};
    this.collapsibleStates = {};

    moods.forEach(mood => {
      const [year, month] = mood.date.split('-');
      const monthLabel = this.months.find(m => m.value === month)?.label;
      const groupKey = `${monthLabel} ${year}`;

      if (!this.groupedMoods[groupKey]) {
        this.groupedMoods[groupKey] = [];
        this.collapsibleStates[groupKey] = true; 
      }
      this.groupedMoods[groupKey].push(mood);
    });
  }

  toggleCollapse(key: string): void {
    this.collapsibleStates[key] = !this.collapsibleStates[key];
  }

  goBack() {
    this.router.navigate(['home']);
  }
}
