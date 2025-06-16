// team-mood.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MoodService } from '../services/mood.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-team-mood-overview',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgChartsModule, FormsModule],
  templateUrl: './team-mood.component.html',
  styleUrls: ['./team-mood.component.css']
})
export class TeamMoodComponent implements OnInit {
  teamName: string = '';
  filterRange: '7d' | '30d' = '7d';
  teamMoods: any[] = [];

  moodChartLabels: string[] = [];
  moodChartData: number[] = [];
  moodChartType: ChartType = 'pie';

  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Team Mood Distribution'
      }
    }
  };

  constructor(
    private moodService: MoodService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const routeTeam = this.route.snapshot.paramMap.get('teamName');
    if (routeTeam) {
      this.teamName = decodeURIComponent(routeTeam);
      this.fetchTeamMoods();
    }
  }

  onFilterChange(range: '7d' | '30d'): void {
    this.filterRange = range;
    this.fetchTeamMoods();
  }

  fetchTeamMoods(): void {
    this.moodService.getTeamMoods(this.teamName, this.filterRange).subscribe(moods => {
      this.teamMoods = moods;
      this.updateChart();
    });
  }

  updateChart(): void {
    const moodCounts: { [mood: string]: number } = {};
    this.teamMoods.forEach(entry => {
      const mood = entry.mood;
       if (mood && typeof mood === 'string' && mood.trim() !== '') {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }
    });

    this.moodChartLabels = Object.keys(moodCounts);
    this.moodChartData = Object.values(moodCounts);
  }
}
