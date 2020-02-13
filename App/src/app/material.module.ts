import { NgModule } from '@angular/core';
import {
  MatTableModule, MatInputModule, MatButtonModule, MatGridListModule, MatTabsModule,
  MatProgressSpinnerModule, MatPaginatorModule, MatCheckboxModule, MatIconModule,
  MatAutocompleteModule, MatDialogModule} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [],
  exports: [
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatTabsModule,
    FlexLayoutModule,
    MatDialogModule
  ]
})
export class MaterialModule { }
