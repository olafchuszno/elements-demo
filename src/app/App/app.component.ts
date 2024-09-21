import { Component, HostListener, inject } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ElementsService } from '../elements.service';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ElementChangeDialog } from '../ElementChangeDialog/element-change-dialog.component';
import { LocalStorageService } from '../core/local-storage.service';

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

  isFetchingElements: boolean = false;

  elements: PeriodicElement[] = [];
  elementsService: ElementsService = inject(ElementsService);

  localStorageService: LocalStorageService = inject(LocalStorageService);

  filterInput = new FormControl('');

  filteredElements: PeriodicElement[] = [];

  isPopUpOpen: boolean = false;

  screenWidth: number | undefined = undefined;

  readonly dialog = inject(MatDialog);

  tableColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  currentFilter: string = '';

  constructor() {
    this.isFetchingElements = true;

    const localElements = this.localStorageService.getAllElements();

    if (localElements === null) {
      this.elementsService
        .getAllElements()
        .then((elements) => {
          this.setElements(elements);
        })
        .finally(() => {
          this.isFetchingElements = false;
        });
    } else {
      this.setElements(localElements);

      this.isFetchingElements = false;
    }

    this.filterInput.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe((text: string | null) => this.filterElements(text || ''));

    this.updateScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  updateScreenSize() {
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

    this.changeElementValue({
      position,
      field,
      newValue: newConvertedValue,
    });

    this.updateFilteredElements();

    this.updateElementsInStorage();
  }

  filterElements(text: string): void {
    this.currentFilter = text;

    this.filteredElements = this.elements.filter((element) => {
      return Object.values(element).some((elementValue) =>
        String(elementValue)
          .toLocaleLowerCase()
          .includes(text.toLocaleLowerCase())
      );
    });
  }

  updateFilteredElements() {
    this.filteredElements = this.elements.filter((element) => {
      return Object.values(element).some((elementValue) =>
        String(elementValue)
          .toLocaleLowerCase()
          .includes(this.currentFilter.toLocaleLowerCase())
      );
    });
  }

  updateElementsInStorage(): void {
    this.localStorageService.setElements(this.elements);
  }

  /**
   *
   * @param editedElementData
   * Updates element value in the main elements state,
   */
  changeElementValue(editedElementData: EditedElementData) {
    const { position, field, newValue } = editedElementData;

    this.elements = this.elements.map((element) => {
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
