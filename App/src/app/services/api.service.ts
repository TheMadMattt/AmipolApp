import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cennik } from '../models/cennik';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private API = environment.ApiUrl + 'products';

    constructor(private http: HttpClient) { }

    getAllItems(): Observable<Cennik> {
        return this.http.get<Cennik>(this.API);
    }

    searchImages(): Observable<void> {
        return this.http.get<void>(this.API + '/searchImages');
    }
}
