import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface MoodEntry {
  _id?: string;
  name: string;
  team: string;
  mood: string;
  note: string;
  date: string;
  dayRating?: number;
}

@Injectable({ providedIn: 'root' })
export class MoodService {
  private dbUrl = 'http://localhost:5984/users';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('Harishwar:harish22')
  });

  constructor(private http: HttpClient) {}

  addMood(entry: MoodEntry): Observable<any> {
    return this.http.post(this.dbUrl, entry, { headers: this.headers });
  }

  saveMoodEntry(entry: MoodEntry): Observable<any> {
    return this.http.post(this.dbUrl, entry, { headers: this.headers });
  }

  getUserMoodDates(name: string): Observable<string[]> {
    const body = {
      selector: { name },
      fields: ['date']
    };
    return this.http.post<any>(`${this.dbUrl}/_find`, body, { headers: this.headers }).pipe(
      map(res => res.docs.map((doc: any) => doc.date))
    );
  }

  getUserMoodStats(name: string): Observable<{ total: number; frequentMood: string }> {
    const body = {
      selector: { name },
      fields: ['mood']
    };
    return this.http.post<any>(`${this.dbUrl}/_find`, body, { headers: this.headers }).pipe(
      map(res => {
        const moodCount: Record<string, number> = {};
        res.docs.forEach((doc: any) => {
          moodCount[doc.mood] = (moodCount[doc.mood] || 0) + 1;
        });
        const entries = Object.entries(moodCount);
        const frequentMood = entries.length
          ? entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
          : 'N/A';
        return {
          total: res.docs.length,
          frequentMood
        };
      })
    );
  }

  getRecentMoods(name: string): Observable<{ mood: string; note: string; date: string }[]> {
    const query = {
      selector: { name },
      sort: [{ date: 'desc' }],
      limit: 3,
      fields: ['mood', 'note', 'date']
    };

    return this.http.post<{ docs: { mood: string; note?: string; date: string }[] }>(
      `${this.dbUrl}/_find`,
      query,
      { headers: this.headers }
    ).pipe(
      map(res =>
        res.docs
          .filter(doc => doc.mood && doc.date)
          .map(doc => ({
            mood: doc.mood,
            note: doc.note || '',
            date: doc.date
          }))
      )
    );
  }

  getTeamMoods(team: string, range: '7d' | '30d'): Observable<MoodEntry[]> {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - (range === '7d' ? 7 : 30));
    const pastISO = pastDate.toISOString().split('T')[0];

    const body = {
      selector: {
        team,
        date: { "$gte": pastISO }
      },
      fields: ['name', 'mood', 'date', 'dayRating']
    };

    return this.http.post<any>(`${this.dbUrl}/_find`, body, { headers: this.headers }).pipe(
      map(res => res.docs)
    );
  }

  createIndexes(): void {
    const indexes = [
      { fields: ['name'], name: 'name-index' },
      { fields: ['date'], name: 'date-index' },
      { fields: ['team'], name: 'team-index' }
    ];

    indexes.forEach(index => {
      const body = {
        index: { fields: index.fields },
        name: index.name,
        type: 'json'
      };

      this.http.post(`${this.dbUrl}/_index`, body, { headers: this.headers }).subscribe({
        next: () => console.log(`Index '${index.name}' created.`),
        error: err => {
          if (err.status === 409) {
            console.warn(`Index '${index.name}' already exists.`);
          } else {
            console.error(`Error creating index '${index.name}':`, err);
          }
        }
      });
    });
  }
}
