// team-mood.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MoodService } from '../services/mood.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-team-mood-overview',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './team-mood.component.html',
  styleUrls: ['./team-mood.component.css']
})
export class TeamMoodComponent implements OnInit {
  teamName: string = '';
  filterRange: '7d' | '30d' = '7d';
  teamMoods: any[] = [];

  heatmapMatrix: { [name: string]: { [date: string]: number } } = {};
  uniqueDates: string[] = [];
  uniqueMembers: string[] = [];

  constructor(
    private moodService: MoodService,
    private route: ActivatedRoute,
    private router:Router
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
      this.generateHeatmapMatrix();
    });
  }

  generateHeatmapMatrix(): void {
    const matrix: { [name: string]: { [date: string]: number } } = {};
    const dates = new Set<string>();
    const members = new Set<string>();

    this.teamMoods.forEach(entry => {
      const name = entry.name;
      const date = entry.date;
      const rating = Number(entry.dayRating); 

      if (!matrix[name]) matrix[name] = {};
      matrix[name][date] = rating;

      dates.add(date);
      members.add(name);
    });

    this.heatmapMatrix = matrix;
    this.uniqueDates = Array.from(dates).sort();
    this.uniqueMembers = Array.from(members).sort();
  }

  getMoodColor(score: number | undefined): string {
    if (score === undefined) return '#ecf0f1';
    if (score >= 4.5) return '#2ecc71';         
    if (score >= 3.5) return '#f1c40f';         
    if (score >= 2.5) return '#e67e22';         
    if (score >= 1.5) return '#e74c3c';         
    return '#c0392b';                          
  }
   
  goToAdminDashboard() {
  this.router.navigate(['/admin']);
  }
}
