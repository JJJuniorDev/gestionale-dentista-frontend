import { NgModule } from "@angular/core";
import { LoadingSpinnerComponent } from "./loading-spinner/loading-spinner.component";
import { CommonModule } from "@angular/common";


@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    // PlaceholderDirective,
    // DropdownDirective,
    //AlertComponent
  ],
  imports: [
    CommonModule
],
  exports: [ //ovunque prendiamo lo sharedModule abbiamo accesso a questi
    // AlertComponent,
    LoadingSpinnerComponent,
    // PlaceholderDirective,
    // DropdownDirective,
    CommonModule
  ],
})
export class SharedModule {}