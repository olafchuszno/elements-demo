import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ElementsService } from './elements.service';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

export interface PeriodicElement {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

type ElementField = keyof PeriodicElement;


interface ElementUnderEdit {
  position: number,
  field: ElementField
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

  elementUnderEdit: ElementUnderEdit | null = null;

  // Dialog model values
  // newValue: string | null = null;

  readonly dialog = inject(MatDialog);

  tableColumns: string[] = [
    'position',
    'name',
    'weight',
    'symbol'
  ];

  constructor() {
    this.elementsService.getAllElements().then((elements) => {
      this.elements = elements;
      this.filteredElements = elements;
    });

    this.filterInput.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe((text: string | null) => this.filterElements(text || ''));
  }

  openDialog(position: number, field: ElementField): void {
    const dialogRef = this.dialog.open(ElementChangeDialog, {
      data: {
        position,
        field,
        elements: this.elements
      }
    });

    // If this underneath works - consider removing the top part
    // And  learn how to make JUST the top part work -
    // and if it would really be easier to just pass the data into the dialog
    // - why would that be better ?
    this.elementUnderEdit = {position, field};

    dialogRef.afterClosed().subscribe((value) => {
      if (value !== undefined) {
        console.log('POPUP CLOSED. VALUE UNDER');
        console.log(value);
        this.finishEditingElement(value)
      }
    })
  }

  openPopUp() {
    this.isPopUpOpen = true;
  }

  closePopUp() {
    this.isPopUpOpen = false;
  }

  startEditingElement(position: number, field: ElementField) {
    this.isPopUpOpen = !this.isPopUpOpen;

    this.elementUnderEdit = {position, field};
  }

  finishEditingElement(newValue: string) {
    const newConvertedValue = this.elementUnderEdit?.field === 'weight' ? +newValue : newValue;

    this.updateElementValue('filteredElements', newConvertedValue);

    this.updateElementValue('elements', newConvertedValue);

    console.log({elements: this.elements})

    this.closePopUp();
    this.elementUnderEdit = null;
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

  updateElementValue(elementsArray: 'elements' | 'filteredElements', newConvertedValue: string | number) {
    console.log('Changing logic | newConvertedValue = ', newConvertedValue);
    console.log('field to change = ', this.elementUnderEdit?.field);
    console.log('position = ', this.elementUnderEdit?.position);

    this[elementsArray] = this[elementsArray].map((element) => {
      if (element.position === this.elementUnderEdit?.position) {
        return {
          ...element,
          [this.elementUnderEdit.field]: newConvertedValue
        }
      } else {
        return element;
      }
    });
  }
}


// DIALOG COMPONENT
@Component({
  selector: 'element-change-dialog',
  templateUrl: 'element-change-dialog.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class ElementChangeDialog {
  // Inject elements form App Component
  // appComponent = inject(AppComponent);
  // elements = this.appComponent.elements;

  constructor() {

  }
}
