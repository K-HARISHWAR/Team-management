// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface User {
  _id?: string;
  _rev?: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  team: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private dbUrl = 'http://localhost:5984/users_db';

  constructor(private http: HttpClient) {}

  createUser(user: User): Observable<any> {
    return this.http.post(this.dbUrl, user);
  }

  getUsersByTeam(team: string): Observable<User[]> {
    const url = `${this.dbUrl}/_find`;
    const body = {
      selector: { team },
      fields: ['_id', 'name', 'role', 'team']
    };
    return this.http.post<any>(url, body).pipe(map(res => res.docs));
  }

  getUserByUsername(username: string): Observable<User | null> {
    const url = `${this.dbUrl}/_find`;
    const body = {
      selector: { username },
      limit: 1
    };
    return this.http.post<any>(url, body).pipe(
      map(res => res.docs.length ? res.docs[0] : null)
    );
  }

  deleteUser(id: string, rev: string): Observable<any> {
    const url = `${this.dbUrl}/${id}?rev=${rev}`;
    return this.http.delete(url);
  }

  updateUser(user: User): Observable<any> {
    if (!user._id || !user['_rev']) {
      throw new Error('User _id and _rev are required for update');
    }
    return this.http.put(`${this.dbUrl}/${user._id}`, user);
  }
}

