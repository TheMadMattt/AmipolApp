import { SafePipe } from './pipe/safe.pipe';
import { ImagePreviewDialogComponent } from './shared/image-preview-dialog/image-preview-dialog.component';
import { MaterialModule } from './material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { AdminComponent } from './core/admin/admin.component';
import { HomeComponent } from './core/home/home.component';
import { SalesComponent, IfChangesDirective } from './core/sales/sales.component';
import { LoginComponent } from './core/login/login.component';
import { SettingsService } from './services/settings.service';
import { SpinnerComponent } from './shared/spinner/spinner';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';

export function loadSettings(settingsService: SettingsService): () => void {
  return () => settingsService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    AdminComponent,
    NavBarComponent,
    HomeComponent,
    SalesComponent,
    IfChangesDirective,
    LoginComponent,
    ConfirmDialogComponent,
    ImagePreviewDialogComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    PortalModule,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pl' },
    SettingsService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadSettings,
      deps: [SettingsService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
