import { Component, ChangeDetectorRef } from '@angular/core';
import { HealthKit, HealthKitOptions } from '@ionic-native/health-kit/ngx';
import { Platform } from '@ionic/angular';
// HKQuantityTypeIdentifierDistanceWheelchair, HKQuantityTypeIdentifierHeight, HKQuantityTypeIdentifierBodyMass, HKQuantityTypeIdentifierDistanceWalkingRunning, HKWorkoutTypeIdentifier, HKQuantityTypeIdentifierActiveEnergyBurned
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public height: number;
  public heightActual = 'Sin datos';
  public weight: number;
  public weightActual = 'Sin datos';
  public steps = 'Sin datos';
  public pasos: number;
  public silla: number;
  public distancia = 'Sin datos';
  public workouts = [];
  constructor(
    private platform: Platform,
    private healthService: HealthKit
  ) {
    platform.ready().then(() => {
      if (platform.is('ios')) {
        this.healthService.available().then(available => {
          if (available) {
            let arr = [
              'HKQuantityTypeIdentifierDistanceWheelchair', 
              'HKQuantityTypeIdentifierBodyMass', 
              'HKQuantityTypeIdentifierHeight', 
              'HKQuantityTypeIdentifierStepCount', 
              'HKWorkoutTypeIdentifier', 
              'HKQuantityTypeIdentifierActiveEnergyBurned', 
              'HKQuantityTypeIdentifierDistanceWalkingRunning'
            ];
            let opciones: HealthKitOptions = {
              readTypes: arr,
              writeTypes: arr
            }
            this.healthService.requestAuthorization(opciones).then(_ => {
              this.cargarDatos();
            });
          }
        });
      }

    });
  }


  cargarDatos() {
    if (this.platform.is('ios')) {
      // Altura
      this.healthService.readHeight({ unit: 'cm' }).then(height => {
        console.log('Altura' + JSON.stringify(height))
        this.heightActual = height.value;

      }, error => {
        console.error('Error recuperando altura: ' + error);
      });


      // Peso
      this.healthService.readWeight({ unit: 'kg' }).then(weight => {
        console.log('Peso ' + JSON.stringify(weight))
        this.weightActual = weight.value;
      }, error => {
        console.error('Error recuperando peso: ' + error);
      });


      // Pasos
      // Query para pasos en las últimas 24 horas
      let stepOptions = {
        startDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // Fecha de hoy, le resto un día.
        endDate: new Date(),
        unit: 'count',
        sampleType: 'HKQuantityTypeIdentifierStepCount'
      };

      this.healthService.querySampleType(stepOptions).then(data => {
        console.log('Pasos ' + JSON.stringify(data))
        let sumaPasos = data.reduce((a, b) => a + b.quantity, 0);
        this.steps = sumaPasos;

      }, error => {
        console.error('Error recuperando pasos: ' + error);
      });

      let sillaOptions = {
        startDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // Fecha de hoy, le resto un día.
        endDate: new Date(),
        unit: 'm',
        sampleType: 'HKQuantityTypeIdentifierDistanceWheelchair'
      };

      this.healthService.querySampleType(sillaOptions).then(data => {
        console.log('Silla ' + JSON.stringify(data))
        let sumaDiastancia = data.reduce((a, b) => a + b.quantity, 0);
        this.distancia = sumaDiastancia + " metros";
      }, error => {
        console.error('Error recuperando silla: ' + error);
      });

       // Workouts
      this.healthService.findWorkouts().then(data => {
        console.log('Workouts ' + JSON.stringify(data))
        this.workouts = data;
      }, error => {
        this.workouts = error;
        console.error('Error recuperando workouts: ' + JSON.stringify(error))
      }).catch((err) => {
        console.error('Error catch workouts ' + JSON.stringify(err))
      });
    }
  }

  guardaAltura() {
    if (this.platform.is('ios')) {
      this.healthService.saveHeight({ unit: 'cm', amount: this.height }).then(_ => {
        this.height = null;
        this.cargarDatos();
      });
    }
  }

  guardarPeso() {
    if (this.platform.is('ios')) {
      this.healthService.saveWeight({ unit: 'kg', amount: this.weight }).then(_ => {
        this.weight = null;
        this.cargarDatos();
      });
    }
  }

  guardaWorkout() {
    if (this.platform.is('ios')) {
      let workout = {
        'activityType': 'HKWorkoutActivityTypeRunning',
        'quantityType': 'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'startDate': new Date(),
        'endDate': null,
        'duration': 6000,
        'energy': 600,
        'energyUnit': 'kcal',
        'distance': 5,
        'distanceUnit': 'km'
      };
      this.healthService.saveWorkout(workout).then(_ => {
        this.cargarDatos();
      }, error => {
        console.log("Error guarda workouts " + JSON.stringify(error))
      });
    }
  }

  guardaPasos() {
    let steps: HealthKitOptions = {
      'startDate': new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      'endDate': new Date(), // now
      'sampleType': 'HKQuantityTypeIdentifierStepCount',
      'unit': 'count',
      'amount': this.pasos
    };

    this.healthService.saveQuantitySample(steps).then(data => {

      this.cargarDatos();
    }, error => {
      console.error('Error guardandopasos: ' + JSON.stringify(error));
    });
  }

  guardaDistanciaSillaRuedas() {
    let chair: HealthKitOptions = {
      'startDate': new Date(),
      'endDate': new Date(), // now
      'sampleType': 'HKQuantityTypeIdentifierDistanceWheelchair',
      'amount': this.silla,
      'unit': 'km'
    };

    this.healthService.saveQuantitySample(chair).then(data => {
      this.cargarDatos();
    }, error => {
      console.error('Error guardaDistanciaSillaRuedas: ' + JSON.stringify(error));
    });
  }
}
