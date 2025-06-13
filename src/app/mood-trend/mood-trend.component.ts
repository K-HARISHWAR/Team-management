import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import PouchDB from 'pouchdb-browser';
import { SessionService } from '../services/session.service';

interface MoodEntry {
  _id: string;
  _rev: string;
  mood: string;
  note: string;
  dayRating: number;
  date: string;
  name: string;
  team: string;
}

@Component({
  selector: 'app-mood-trend',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './mood-trend.component.html',
  styleUrls: ['./mood-trend.component.css']
})
export class MoodTrendComponent implements OnInit {
  db = new PouchDB('http://Harishwar:harish22@localhost:5984/users');

  lineChartData!: ChartData<'line'>;
  pieChartData!: ChartData<'pie'>;

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Day Rating'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  constructor(private session: SessionService) {}

  ngOnInit(): void {
    this.fetchUserMoodData();

    this.db.sync('http://Harishwar:harish22@localhost:5984/users', {
      live: true,
      retry: true,
    }).on('change', () => {
      this.fetchUserMoodData();
    });
  }

  async fetchUserMoodData() {
    const name = this.session.name;
    if (!name) {
      console.log('No username found');
      return;
    }

    const result = await this.db.allDocs({ include_docs: true });
    const entries: MoodEntry[] = result.rows
      .map(row => row.doc as MoodEntry)
      .filter(doc => doc.name === name && doc.date && typeof doc.dayRating === 'number');

    this.prepareLineChart(entries);
    this.preparePieChart(entries);
  }

  prepareLineChart(entries: MoodEntry[]) {
    const sorted = entries.sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(e => e.date);
    const data = sorted.map(e => e.dayRating);

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Day Rating Over Time',
          data,
          fill: false,
          borderColor: 'blue',
          tension: 0.3,
        },
      ],
    };
  }

  preparePieChart(entries: MoodEntry[]) {
    const moodCounts: Record<string, number> = {};
    for (let entry of entries) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }

    const labels = Object.keys(moodCounts);
    const data = Object.values(moodCounts);

    this.pieChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'],
        },
      ],
    };
  }
}
