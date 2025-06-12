import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface MoodEntry {
  _id?: string;
  username: string;
  team: string;
  mood: string;
  note: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class MoodService {
  private dbUrl = 'http://localhost:5984/users';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('Harishwar:harish22')
  });

  constructor(private http: HttpClient) {}

  // 📌 1. Add mood entry
  addMood(entry: MoodEntry): Observable<any> {
    return this.http.post(this.dbUrl, entry, { headers: this.headers });
  }

  // 📌 2. Save mood entry (same as addMood for now)
  saveMoodEntry(entry: MoodEntry): Observable<any> {
    return this.http.post(this.dbUrl, entry, { headers: this.headers });
  }

  // 📌 3. Get all mood dates for streak calculation
  getUserMoodDates(username: string): Observable<string[]> {
    const body = {
      selector: { username },
      fields: ['date']
    };
    return this.http.post<any>(`${this.dbUrl}/_find`, body, { headers: this.headers }).pipe(
      map(res => res.docs.map((doc: any) => doc.date))
    );
  }

  // 📌 4. Get stats: total entries + most frequent mood
  getUserMoodStats(username: string): Observable<{ total: number; frequentMood: string }> {
    const body = {
      selector: { username },
      fields: ['mood']
    };
    return this.http.post<any>(`${this.dbUrl}/_find`, body, { headers: this.headers }).pipe(
      map(res => {
        const moodCount: Record<string, number> = {};
        res.docs.forEach((doc: any) => {
          moodCount[doc.mood] = (moodCount[doc.mood] || 0) + 1;
        });
        const entries = Object.entries(moodCount) as [string, number][];
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

  // 📌 5. Get latest 3 mood entries (sorted)
  getRecentMoods(username: string): Observable<{ mood: string; note: string; date: string }[]> {
    const query = {
      selector: { username },
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

  // 📌 6. Get all moods for a team (used in admin dashboard)
  getTeamMoods(team: string, range: '7d' | '30d'): Observable<MoodEntry[]> {
    const body = {
      selector: { team },
      fields: ['username', 'mood', 'date']
    };
    return this.http.post<any>(`${this.dbUrl}/_find`, body, { headers: this.headers }).pipe(
      map(res => res.docs)
    );
  }

  // 📌 7. Create indexes for username, date, team (call once)
  createIndexes(): void {
    const indexes = [
      { fields: ['username'], name: 'username-index' },
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
