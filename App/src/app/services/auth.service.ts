import { HttpClient } from '@angular/common/http';
import { User } from './../models/user';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private API = environment.ApiUrl + 'Auth';

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
     }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(user: User) {
        return this.http.post<User>(this.API, user).pipe(
            map(userChecked => {
                localStorage.setItem('currentUser', JSON.stringify(userChecked));
                this.currentUserSubject.next(userChecked);

                return userChecked;
            })
        );
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
