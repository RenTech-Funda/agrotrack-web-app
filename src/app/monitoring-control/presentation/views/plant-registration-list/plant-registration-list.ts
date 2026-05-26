import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PlantRegistrationForm } from '../plant-registration-form/plant-registration-form';

interface Plant {
  id?: number;
  height: number;
  leaves: number;
  fruits: number;
  date: string;
}

@Component({
  selector: 'app-plant-registration-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PlantRegistrationForm],
  templateUrl: './plant-registration-list.html',
  styleUrl: './plant-registration-list.css'
})
export class PlantRegistrationList {
  plants: Plant[] = [
    { id: 1, height: 25.5, leaves: 12, fruits: 3, date: '2025-01-05' },
    { id: 2, height: 30.2, leaves: 15, fruits: 5, date: '2025-01-08' },
    { id: 3, height: 28.0, leaves: 11, fruits: 2, date: '2025-01-10' }
  ];
  showForm = false;

  onPlantAdded(newPlant: Plant) {
    this.plants.push(newPlant);
    this.showForm = false;
  }
}
