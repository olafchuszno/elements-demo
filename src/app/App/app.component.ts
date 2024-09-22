import { Component, HostListener, inject } from '@angular/core';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
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
import { rxState } from '@rx-angular/state';
import { RxPush } from '@rx-angular/template/push';
import { RxLet } from '@rx-angular/template/let';
import { RxFor } from '@rx-angular/template/for';


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

interface State {
  elements: PeriodicElement[];
  filteredElements: PeriodicElement[];
  currentFilter: string;
  isFetchingElements: boolean;
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
    RxFor,
    RxLet,
    RxPush,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private state = rxState<State>(({ set }) => {
    set({
      elements: [],
      filteredElements: [],
      currentFilter: '',
      isFetchingElements: false,
    });
  });

  readonly elements$ = this.state.select('elements')
  readonly filteredElements$ = this.state.select('filteredElements')
  readonly currentFilter$ = this.state.select('currentFilter')
  readonly isFetchingElements$ = this.state.select('isFetchingElements')
  state$ = this.state.select();


  elements: PeriodicElement[] = [];
  filteredElements: PeriodicElement[] = [];
  isFetchingElements: boolean = false;

  elementsService: ElementsService = inject(ElementsService);

  localStorageService: LocalStorageService = inject(LocalStorageService);

  filterInput = new FormControl('');

  isPopUpOpen: boolean = false;

  screenWidth: number | undefined = undefined;

  readonly dialog = inject(MatDialog);

  tableColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  constructor() {
    this.state.connect('isFetchingElements', this.isFetchingElements$);
    this.state.connect('filteredElements', this.filteredElements$);
    this.state.connect('elements', this.elements$);

    this.state.set({ isFetchingElements: true });

    const localElements = this.localStorageService.getAllElements();

    if (localElements === null) {
      this.elementsService
        .getAllElements()
        .then((elements) => {
          this.setElements(elements);
        })
        .finally(() => {
          this.state.set({ isFetchingElements: false });
        });
    } else {
      this.setElements(localElements);

      this.state.set({ isFetchingElements: false });
    }

    this.state.connect('filteredElements', this.filterInput.valueChanges
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        map((filterValue) => {
          this.filterElements(filterValue || '');
          return this.state.get('filteredElements')
        })
      )
    )

    this.updateScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  updateScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  setElements(elements: PeriodicElement[]) {
    this.state.set({
      elements: elements,
      filteredElements: elements
    });
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
    this.state.set({currentFilter: text});

    const filteredElements = this.state.get('elements').filter((element) => {
      return Object.values(element).some((elementValue) =>
        String(elementValue)
          .toLocaleLowerCase()
          .includes(text.toLocaleLowerCase())
      );
    });

    this.state.set({filteredElements});
  }

  // TODO: Refactor - just call filterElements with currentFilter from the state
  updateFilteredElements() {
    const filteredElements = this.state.get('elements').filter((element) => {
      return Object.values(element).some((elementValue) =>
        String(elementValue)
          .toLocaleLowerCase()
          .includes(this.state.get('currentFilter').toLocaleLowerCase())
      );
    });

    this.state.set({ filteredElements });
  }

  updateElementsInStorage(): void {
    this.localStorageService.setElements(this.state.get('elements'));
  }

  /**
   *
   * @param editedElementData
   * Updates element value in the main elements state,
   */
  changeElementValue(editedElementData: EditedElementData) {
    const { position, field, newValue } = editedElementData;

    const updatedElements = this.state.get('elements').map((element) => {
      if (element.position === position) {
        return {
          ...element,
          [field]: newValue,
        };
      } else {
        return element;
      }
    });

    this.state.set({elements: updatedElements})
  }
}
