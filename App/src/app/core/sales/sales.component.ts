import { Subscription, timer, forkJoin } from 'rxjs';
import { Component, OnInit, OnDestroy, Directive, ViewContainerRef, TemplateRef, Input } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { registerLocaleData } from '@angular/common';
import localePL from '@angular/common/locales/pl';
import { trigger, style, transition, animate } from '@angular/animations';
import { Items } from 'src/app/models/items';
import { UiService } from 'src/app/services/ui.service';
import { ApiService } from 'src/app/services/api.service';
import { SettingsService } from 'src/app/services/settings.service';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[ifChanges]'
})
export class IfChangesDirective {
  private currentValue: any;
  private hasView = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) { }

  @Input() set ifChanges(val: any) {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (val !== this.currentValue) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.currentValue = val;
    }
  }
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  animations: [
    trigger('saleAnimation', [
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.6s ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition('* => void', [
        animate('0.6s ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ],
})
export class SalesComponent implements OnInit, OnDestroy {
  promocje: Items[];
  displaySales: Items[];
  products$: Subscription;
  currentItem$: Subscription;
  currentItem: Items;
  index = 0;
  promoNumber = 0;
  saleDuration = 5;

  constructor(private uiService: UiService,
              private apiService: ApiService,
              private settingsService: SettingsService) { }

  ngOnInit() {
    registerLocaleData(localePL, 'pl');
    document.getElementById('navbar').style.display = 'none';

    this.uiService.spin$.next('Ładowanie promocji...');
    this.products$ = timer(0, 5000).pipe(
      switchMap(() => forkJoin(this.apiService.getAllItems(), this.settingsService.getSettings()))
    ).subscribe((data: any) => {
      if (data != null) {
        this.promocje = data[0].cennik;
        this.settingsService.settings = data[1];
        this.initDisplayElements();
      }
    });

    this.saleDuration = this.settingsService.settings.saleDuration;
    this.currentSaleTimer();
  }

  ngOnDestroy(): void {
    this.products$.unsubscribe();
    this.currentItem$.unsubscribe();
  }

  initDisplayElements(): void {
    this.promocje.forEach(element => {
      const split = element.nazwa.match(/.{1,15}(\s|$)/g);
      let temp = '';
      split.forEach(nameSplit => {
        temp += nameSplit + '\n';
      });
      element.nazwa = temp;
      const findElement = this.settingsService.settings.salesList.find(x => x.name === element.index);
      if (findElement != null) {
        element.wyswietlane = findElement.displaying;
      } else {
        element.wyswietlane = true;
      }
    });
    this.displaySales = this.promocje.filter(x => x.wyswietlane === true);
    if (this.saleDuration !== this.settingsService.settings.saleDuration) {
      this.saleDuration = this.settingsService.settings.saleDuration;
      this.currentItem$.unsubscribe();
      this.currentItem$.remove(this.currentItem$);
      this.currentSaleTimer();
    }
  }

  currentSaleTimer() {
    this.currentItem$ = timer(0, this.saleDuration * 1000).subscribe(() => {
      if (this.displaySales && this.displaySales.length > 0) {
        if (this.index >= this.displaySales.length) {
          this.index = 0;
        }
        if (this.promoNumber >= this.displaySales.length) {
          this.promoNumber = 0;
        }
        if (this.displaySales[this.index].wyswietlane) {
          if (this.promoNumber >= this.displaySales.length) {
            this.promoNumber = 0;
          }
          this.currentItem = this.displaySales[this.index];
          this.promoNumber++;
          this.uiService.spin$.next(null);
        }
        this.index++;
        if (this.index === this.displaySales.length) {
          this.index = 0;
        }
      }
    });
  }

  roundDiscount(value) {
    return Math.round(value);
  }
}
