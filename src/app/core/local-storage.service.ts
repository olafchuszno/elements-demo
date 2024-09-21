import { Injectable } from '@angular/core';
import { PeriodicElement } from '../App/app.component';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getAllElements(): null | PeriodicElement[] {
    const elements = localStorage.getItem('elements');

    return elements === null ? null : JSON.parse(elements)
  }

  setElements(elements: PeriodicElement[]) {
    localStorage.setItem('elements', JSON.stringify(elements));
  }
}
