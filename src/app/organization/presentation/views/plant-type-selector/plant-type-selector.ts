import {Component, inject, signal, forwardRef} from '@angular/core';
import {OrganizationStore} from '../../../application/organization.store';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {PlantType, PlantTypes} from '../../../domain/model/plant-type.entity';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-plant-type-selector',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
    FormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlantTypeSelector),
      multi: true
    }
  ],
  templateUrl: './plant-type-selector.html',
  styleUrl: './plant-type-selector.css'
})
export class PlantTypeSelector implements ControlValueAccessor {
  readonly store = inject(OrganizationStore);
  private readonly translate = inject(TranslateService);

  addingCustomPlantType = signal(false);
  newTypeName = signal('');
  selectedPlantType: PlantType | null = null;

  private onChange = (value: PlantType | null) => {};
  private onTouched = () => {};

  constructor() {
    // Cargar los plant types cuando se inicializa el componente
    this.store.loadPlantTypes();
  }

  // ControlValueAccessor methods
  writeValue(value: PlantType | null): void {
    this.selectedPlantType = value;
  }

  registerOnChange(fn: (value: PlantType | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Select a plant type and update the form control.
   * @param type The selected plantType
   */
  selectPlantType(type: PlantType): void {
    this.selectedPlantType = type;
    this.onChange(type);
    this.onTouched();
  }

  /**
   * Start adding a custom plant type.
   */
  enableAddCustomPlantType(): void {
    this.addingCustomPlantType.set(true);
  }

  /**
   * Add a new custom plant type.
   */
  addCustomPlantType(): void {
    const typeName = this.newTypeName().trim();
    if(!typeName) return;

    const newPlantType = new PlantType({
      id: Date.now(),
      name: typeName,
      type: PlantTypes.CUSTOM,
      isCustom: true
    });

    this.store.addPlantType(newPlantType);
    this.selectPlantType(newPlantType);

    this.newTypeName.set('');
    this.addingCustomPlantType.set(false);
  }

  /** Cancel adding a custom plant type. */
  cancelAddCustomPlantType(): void {
    this.newTypeName.set('');
    this.addingCustomPlantType.set(false);
  }

  // Getters para el template
  get newTypeNameValue(): string {
    return this.newTypeName();
  }

  set newTypeNameValue(value: string) {
    this.newTypeName.set(value);
  }
}
