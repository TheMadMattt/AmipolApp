import { ImagePreviewDialogComponent } from './../../shared/image-preview-dialog/image-preview-dialog.component';
import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { Subscription, timer } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpEventType } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePL from '@angular/common/locales/pl';
import { Items } from 'src/app/models/items';
import { UiService } from 'src/app/services/ui.service';
import { ApiService } from 'src/app/services/api.service';
import { ImageService } from 'src/app/services/image.service';
import { SettingsService } from 'src/app/services/settings.service';
import { Cennik } from 'src/app/models/cennik';
import { SalesSettings } from 'src/app/models/salesSettings';
import { Settings } from 'src/app/models/settings';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  promocje: Items[];
  displayedColumns: string[] = ['index', 'nazwa', 'hasImage', 'jm', 'cena', 'rabat', 'waznosc', 'promocja', 'stan', 'state'];
  dataSource = new MatTableDataSource<Items>([]);
  products$: Subscription;
  settings$: Subscription;
  selectedAll = false;
  saleDuration = 5;
  expandedElement: Items | null;
  progress: number;
  message: string;
  searchValue: string;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private uiService: UiService,
    private apiService: ApiService,
    private imageService: ImageService,
    private settingsService: SettingsService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    registerLocaleData(localePL, 'pl');
    document.getElementById('navbar').style.display = 'block';

    this.products$ = timer(0, 120000).pipe(
      tap(() => this.uiService.spin$.next('Ładowanie...')),
      switchMap(() => this.apiService.getAllItems())
    ).subscribe((data: Cennik) => {
      if (data != null) {
        this.promocje = data.cennik;
        this.initDisplayElements();
        this.dataSource.data = this.promocje;
      }
      this.uiService.spin$.next(null);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.products$.unsubscribe();
  }

  initDisplayElements(): void {
    this.promocje.forEach(element => {
      const findElement = this.settingsService.settings.salesList.find(x => x.name === element.index);
      if (findElement != null) {
        element.wyswietlane = findElement.displaying;
      } else {
        element.wyswietlane = true;
      }
    });
    this.saleDuration = this.settingsService.settings.saleDuration;

    this.allItemsSelected();
  }

  allItemsSelected() {
    let counter = 0;
    this.promocje.forEach(item => {
      if (item.wyswietlane) {
        counter++;
      }
    });
    if (counter === this.promocje.length) {
      this.selectedAll = true;
    } else {
      this.selectedAll = false;
    }
  }

  selectAll() {
    if (this.selectedAll) {
      this.promocje.forEach(item => {
        item.wyswietlane = true;
      });
    } else {
      this.promocje.forEach(item => {
        item.wyswietlane = false;
      });
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  searchImages() {
    this.uiService.spin$.next('Szukanie obrazków');
    this.apiService.searchImages().subscribe(() => {
      this.uiService.spin$.next(null);
    });
  }

  saveSettings() {
    const salesList: SalesSettings[] = [];

    this.promocje.forEach(item => {
      const settings: SalesSettings = {
        name: item.index,
        displaying: item.wyswietlane,
        selectedImage: 0
      };
      salesList.push(settings);
    });
    this.settingsService.settings.salesList = salesList;
    this.settingsService.settings.saleDuration = this.saleDuration;

    this.settingsService.saveSettings(this.settingsService.settings).subscribe((settings: Settings) => {
      this.settingsService.settings = settings;
    });
  }

  uploadFile = (files, itemIndex) => {
    if (files.length === 0) {
      return;
    }

    const fileToUpload = files[0] as File;
    const formData = new FormData();
    formData.append(itemIndex, fileToUpload, fileToUpload.name);

    this.imageService.uploadImage(formData)
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.message = 'Obrazek został załadowany';
          this.promocje.find(x => x.index === itemIndex).imageUrl = event.body['imageUrl'];
        }
      });
  }

  deleteImage(itemIndex: string, itemName: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Czy napewno chcesz usunąć obrazek do produktu: ', itemName }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.imageService.deleteImage(itemIndex).subscribe((event) => {
          if (event.type === HttpEventType.Response) {
            this.promocje.find(x => x.index === itemIndex).imageUrl = null;
            this.message = 'Obrazek został usunięty';
            this.progress = 0;
          }
        });
      }
    });
  }

  expandItem(element) {
    this.expandedElement = this.expandedElement === element ? null : element;
    if (this.message) {
      this.message = null;
    }
    if (this.progress) {
      this.progress = 0;
    }
  }

  clearSearch() {
    this.dataSource.filter = '';
    this.searchValue = '';
  }

  showImage(itemName: string, imageUrl: string) {
    const dialogRef = this.dialog.open(ImagePreviewDialogComponent, {
      width: '600px',
      data: { itemName, imageUrl }
    });
  }
}
