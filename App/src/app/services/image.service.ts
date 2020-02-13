import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private API = environment.ApiUrl + 'image';

    constructor(private http: HttpClient) { }

    uploadImage(image: FormData) {
        return this.http.post(this.API, image, { reportProgress: true, observe: 'events' });
    }

    deleteImage(itemIndex: string) {
        console.log(itemIndex);
        return this.http.delete(this.API + '/delete?itemIndex=' + itemIndex, { observe: 'events' });
    }
}
