import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from './auth.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  private isAuthenticated: boolean = false;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post('http://localhost:3000/api/user/signup', authData)
      .subscribe((res) => {
        console.log(res);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post<{ token: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe((res) => {
        const token = res.token;
        this.token = token;
        if (token) {
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
        }
      });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
  }
}
