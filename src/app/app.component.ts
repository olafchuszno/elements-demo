import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ElementsService } from './elements.service';
import { CommonModule } from '@angular/common';


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

  filteredElements: PeriodicElement[] = [];

  constructor() {
    this.elementsService.getAllElements().then((elements) => {
      this.elements = elements;
      this.filteredElements = elements;
    });
  }

  filterElements(text: string): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.timeoutId = setTimeout(() => this.filterElementsByText(text), 2000);
  }

  filterElementsByText(text: string) {
      this.filteredElements = this.elements.filter((element) => {
        for (const elementValue of Object.values(element)) {
          if (String(elementValue).toLocaleLowerCase().includes(text.toLocaleLowerCase())) {
            return true;
          }
        }

        return false;
      });

      this.timeoutId = null;
  }
}
