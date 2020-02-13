import { PORTAL_DATA } from './../token';
import { Component, Inject } from '@angular/core';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.html',
    styleUrls: ['./spinner.css'],
})

export class SpinnerComponent {
    constructor(@Inject(PORTAL_DATA) public data: string) { }
}
