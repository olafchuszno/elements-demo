import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import { ElementField } from "../App/app.component";

@Component({
  selector: 'element-change-dialog',
  templateUrl: 'element-change-dialog.html',
  styleUrl: './element-change-dialog.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
  ],
})

export class ElementChangeDialog {
[x: string]: any;
  public data: {
    position: number
    elementName: string;
    field: ElementField
    currentValue: string | number
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: {
      position: number;
      elementName: string;
      field: ElementField;
      currentValue: string | number;
    }
  ) {
    this.data = data;
  }

  isValidWeight(weight: string) {
    return !Number.isNaN(+weight)
  }
}
