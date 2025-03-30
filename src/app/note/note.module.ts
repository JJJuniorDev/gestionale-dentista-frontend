import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { NoteItemComponent } from './components/note-item.component';
// import { NoteFormComponent } from './components/note-form.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotesListComponent } from './notes-list/notes-list.component';
import { NotesRoutingModule } from './notes-routing.module';
import { AddNoteDialogComponent } from './modali/add-note-dialog/add-note-dialog.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { SelectPatientDialogComponent } from './modali/select-patient-dialog/select-patient-dialog.component';
import {  MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [NotesListComponent, AddNoteDialogComponent, SelectPatientDialogComponent],
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    NotesRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  exports: [NotesListComponent],
})
export class NotesModule {}
