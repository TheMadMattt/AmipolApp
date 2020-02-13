import { Injectable, Injector } from '@angular/core';

import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { SpinnerComponent } from '../shared/spinner/spinner';

import { Subject } from 'rxjs';
import { PORTAL_DATA } from '../shared/token';

@Injectable({
    providedIn: 'root',
})
export class UiService {

    private spinnerTopRef: OverlayRef = this.cdkSpinnerCreate();
    spin$: Subject<string> = new Subject();

    constructor(private overlay: Overlay, private injector: Injector) {
        this.spin$.asObservable().subscribe((res) => {
            if (res) {
                this.showSpinner(res);
            } else {
                if (this.spinnerTopRef.hasAttached()) {
                    this.stopSpinner();
                }
            }
        });
    }

    private cdkSpinnerCreate() {
        return this.overlay.create({
            hasBackdrop: true,
            backdropClass: 'dark-backdrop',
            positionStrategy: this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically()
        });
    }

    private createInjector(data): PortalInjector {
        const injectorTokens = new WeakMap();
        injectorTokens.set(PORTAL_DATA, data);
        return new PortalInjector(this.injector, injectorTokens);
    }

    private showSpinner(text: string) {
        this.spinnerTopRef.attach(new ComponentPortal(SpinnerComponent, null, this.createInjector(text)));
    }

    private stopSpinner() {
        this.spinnerTopRef.detach();
    }
}
