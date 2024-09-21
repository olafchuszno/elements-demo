import { Component, HostListener, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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

  elements: PeriodicElement[] = [];
  elementsService: ElementsService = inject(ElementsService);

  filterInput = new FormControl('');

  filteredElements: PeriodicElement[] = [];

  isPopUpOpen: boolean = false;

  screenWidth: number | undefined = undefined;

  readonly dialog = inject(MatDialog);

  tableColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  constructor() {
    const localElements = localStorage.getItem('elements');

    if (localElements !== null) {
      this.setElements(JSON.parse(localElements) as PeriodicElement[])
    } else {
      this.elementsService.getAllElements().then((elements) => {
        this.setElements(elements)
      });
    }

    this.filterInput.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe((text: string | null) => this.filterElements(text || ''));

    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
    getScreenSize() {
      this.screenWidth = window.innerWidth;
    }


  setElements(elements: PeriodicElement[]) {
    this.elements = elements;
    this.filteredElements = elements;
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

    if (Number.isNaN(newConvertedValue)) {
      if (String(newValue).includes(',')) {
        alert('Weight value has to be numeric. (A comma "," makes the value a text - consider changing it for a dot ".")')
      } else {
        alert('Weight value has to be numeric.')
      }

      return;
    }

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

    if (elementsArray === 'elements') {
      localStorage.setItem('elements', JSON.stringify(this.elements))
    }
  }
}
