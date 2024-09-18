import { Injectable } from '@angular/core';
import { PeriodicElement } from './app.component';

@Injectable({
  providedIn: 'root'
})
export class ElementsService {
  elementsUrl = "https://dummyjson.com/c/31bc-c3eb-4c4a-8668";

  constructor() { }

  async getAllElements(): Promise<PeriodicElement[]> {
    const elements = await fetch(this.elementsUrl);

    const parsedElements = await elements.json()

    return parsedElements.elements ?? [];
  }
}
