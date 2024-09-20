import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ElementsService } from '../elements.service';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { ElementChangeDialog } from '../ElementChangeDialog/element-change-dialog.component';

export interface PeriodicElement {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

export type ElementField = keyof PeriodicElement;

export interface EditedElementData {
  position: number;
  field: ElementField;
  newValue: string | number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'elements-test';

  timeoutId: any;

  elements: PeriodicElement[] = [];
  elementsService: ElementsService = inject(ElementsService);

  filterInput = new FormControl('');

  filteredElements: PeriodicElement[] = [];

  isPopUpOpen: boolean = false;

  readonly dialog = inject(MatDialog);

  tableColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  constructor() {
    this.elementsService.getAllElements().then((elements) => {
      this.elements = elements;
      this.filteredElements = elements;
    });

    this.filterInput.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe((text: string | null) => this.filterElements(text || ''));
  }

  openDialog(
    position: number,
    elementName: string,
    field: ElementField,
    currentValue: string | number
  ): void {
    const dialogRef = this.dialog.open(ElementChangeDialog, {
      data: {
        position,
        elementName,
        field,
        currentValue,
      },
    });

    dialogRef.afterClosed().subscribe((newValue) => {
      if (newValue !== undefined) {
        this.finishEditingElement({ position, field, newValue });
      }
    });
  }

  finishEditingElement(editedElementData: EditedElementData) {
    const { position, field, newValue } = editedElementData;
    const newConvertedValue = field === 'weight' ? +newValue : newValue;

    this.updateElementValue('filteredElements', {
      position,
      field,
      newValue: newConvertedValue,
    });
    this.updateElementValue('elements', {
      position,
      field,
      newValue: newConvertedValue,
    });

    console.log({ elements: this.elements });
  }

  filterElements(text: string): void {
    this.filteredElements = this.elements.filter((element) => {
      return Object.values(element).some((elementValue) =>
        String(elementValue)
          .toLocaleLowerCase()
          .includes(text.toLocaleLowerCase())
      );
    });
  }

  updateElementValue(
    elementsArray: 'elements' | 'filteredElements',
    editedElementData: EditedElementData
  ) {
    const { position, field, newValue } = editedElementData;

    console.log('Changing logic | newConvertedValue = ', newValue);
    console.log('field to change = ', field);
    console.log('position = ', position);

    this[elementsArray] = this[elementsArray].map((element) => {
      if (element.position === position) {
        return {
          ...element,
          [field]: newValue,
        };
      } else {
        return element;
      }
    });
  }
}
