import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ElementsService } from './elements.service';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface PeriodicElement {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
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

  constructor() {
    this.elementsService.getAllElements().then((elements) => {
      this.elements = elements;
      this.filteredElements = elements;
    });

    this.filterInput.valueChanges
      .pipe(
        debounceTime(2000),
        distinctUntilChanged()
      )
      .subscribe((text: string | null) => this.filterElements(text || ''));
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
}
