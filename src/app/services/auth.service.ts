import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private dbUrl = 'http://localhost:5984/users'; 
  private couchUsername = 'Harishwar'; 
  private couchPassword = 'harish22';   

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<any> {
    const authHeader = 'Basic ' + btoa(`${this.couchUsername}:${this.couchPassword}`);

    const headers = new HttpHeaders({
      Authorization: authHeader,
      'Content-Type': 'application/json'
    });

    const body = {
      selector: {
        email: email
      },
      limit: 1
    };

    try {
      const response: any = await this.http.post(`${this.dbUrl}/_find`, body, { headers }).toPromise();

      if (response.docs.length === 0) {
        throw new Error('User not found');
      }

      const user = response.docs[0];

      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }
}
