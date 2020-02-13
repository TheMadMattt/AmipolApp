import { Settings } from './../models/settings';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private API = environment.ApiUrl + 'Settings';
  settings: Settings = {
    salesList: [],
    saleDuration: 5
  };

  constructor(private http: HttpClient) { }

  load(): Promise<any> {
    this.settings = null;

    return this.http.get(this.API).toPromise().then((data: Settings) => {
      this.settings = data;
    }).catch(err => Promise.resolve());
  }

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(this.API);
  }

  saveSettings(settings: Settings): Observable<Settings> {
    return this.http.post<Settings>(this.API, settings);
  }
}
