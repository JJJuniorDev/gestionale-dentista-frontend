import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { PazienteService } from '../pazienti/paziente.service';
import { Paziente } from '../pazienti/paziente.model';
import { AppuntamentoService } from '../appuntamenti/appuntamento.service';
import { Appuntamento } from '../appuntamenti/appuntamento.model';
import { AppuntamentoDTO } from '../appuntamenti/appuntamentoDTO.model';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  // @ViewChild('appointmentsChart') appointmentsChart:
  //   | BaseChartDirective
  //   | undefined;
  // @ViewChild('patientsChart') patientsChart: BaseChartDirective | undefined;
  // @ViewChild('serverChart') serverChart: BaseChartDirective | undefined;
  // @ViewChild('comparisonChart') comparisonChart: BaseChartDirective | undefined;
  chartData: number[] = [];
  appointmentsData: number[] = [];
  operationsData: number[] = [];
  patientChart: any; // Grafico per i pazienti
  appointmentChart: any; // Grafico per gli appuntamenti
  numberOfPatients: any;
  numberOfPatientsInAttesa: any;
  numberOfPatientsCompleted: any;
  numberOfPatientsConclusi: any;
  numberOfAppointments: any;
  numberOfAppointmentsWithTrattamento: any;
  // Variabili per la ricerca e grafico appuntamenti del paziente
  patientAppointmentsChart: any;
  searchedCodiceFiscale: string = 'RTMLNZ98L06H096Y';
  selectedPatient: Paziente | null = null;
  patientAppointments: AppuntamentoDTO[] = [];
  //PARAMETRI GRAFICO ETA PAZIENTI
  //DA QUI
  selectedParameter: string = 'stato'; // Parametro selezionato
  generalChartData: number[] = [];
  ageRanges: string[] = ['0-18', '19-35', '36-60', '60+']; // Intervalli di età
  // A QUI
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private pazienteService: PazienteService,
    private appuntamentoService: AppuntamentoService
  ) {}

  ngOnInit(): void {
    this.pazienteService.getPazienti().subscribe((pazienti: Paziente[]) => {
      // Calcolo statistiche
      this.numberOfPatients = pazienti.length;
      this.numberOfPatientsInAttesa = pazienti.filter(
        (p: any) => p.stato === 'in attesa'
      ).length;
      this.numberOfPatientsCompleted = pazienti.filter(
        (p: any) => p.stato === 'attivo'
      ).length;
      this.numberOfPatientsConclusi = pazienti.filter(
        (p: any) => p.stato === 'concluso'
      ).length;

      // Prepara i dati per il grafico
      this.chartData = [
        this.numberOfPatientsInAttesa,
        this.numberOfPatientsCompleted,
        this.numberOfPatientsConclusi,
      ];

      // Aggiorna il grafico dei pazienti
      this.createCharts(
        'generalChart',
        this.chartData,
        ['In attesa', 'Attivo', 'Concluso'],
        'patientChart'
      );
      // this.updatePatientChart();
    });

    this.appuntamentoService
      .getAppuntamenti()
      .subscribe((appuntamenti: AppuntamentoDTO[]) => {
        this.numberOfAppointments = appuntamenti.length;
        this.numberOfAppointmentsWithTrattamento = appuntamenti.filter(
          (p: any) => p.trattamento === 'h'
        ).length;
        // Prepara i dati per gli appuntamenti (Esempio: basato sullo stato degli appuntamenti)
        this.appointmentsData = [
          this.numberOfAppointments, // esempio
          this.numberOfAppointmentsWithTrattamento, // esempio
        ];
        // Aggiorna il grafico degli appuntamenti
        this.createCharts(
          'appointmentsChart',
          this.appointmentsData,
          ['Appuntamenti totali', 'Appuntamenti con trattamento cercato'],
          'appointmentChart'
        );
      });
    // Prepara i dati per le operazioni (Esempio: basato sullo stato delle operazioni)
    this.operationsData = [
      this.numberOfPatientsInAttesa, // esempio
      this.numberOfPatientsCompleted, // esempio
    ];
  }

  ngAfterViewInit(): void {
    // Questo è dove inizializzi il grafico solo una volta, se necessario
    this.createCharts(
      'generalChart',
      this.chartData,
      ['in attesa', 'attivo', 'concluso'],
      'patientChart'
    );
    this.createCharts(
      'appointmentsChart',
      this.appointmentsData,
      ['numberOfAppointments', 'numberOfAppointmentsWithTrattamento'],
      'appointmentsChart'
    );
  }

  createCharts(
    chartId: string,
    chartData: number[],
    labels: string[],
    chartRef: string
  ) {
    const canvasElement = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvasElement) {
      console.error(`Canvas con ID ${chartId} non trovato!`);
      return; // Esci dalla funzione se il canvas non esiste
    }
    // Distruggi il grafico esistente solo se la variabile del grafico è già presente
    if (chartRef === 'patientChart' && this.patientChart) {
      this.patientChart.destroy();
    }
    if (chartRef === 'appointmentChart' && this.appointmentChart) {
      this.appointmentChart.destroy();
    }

    const ctx = canvasElement.getContext('2d');
    if (ctx) {
      // Crea un nuovo grafico e assegna il riferimento alla variabile appropriata
      if (chartRef === 'patientChart') {
        this.patientChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Distribuzione',
                data: chartData,
                backgroundColor: ['#ff9999', '#66b3ff', '#99ff99'],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true, // Rende il grafico responsivo
            maintainAspectRatio: true,
          },
        });
      }

      if (chartRef === 'appointmentChart') {
        this.appointmentChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Distribuzione degli Appuntamenti',
                data: chartData,
                backgroundColor: ['#ff9999', '#66b3ff', '#99ff99'],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
          },
        });
      }
      if (chartRef === 'patientAppointmentsChart') {
        this.patientAppointmentsChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Distribuzione APP Pazienti',
                data: chartData,
                backgroundColor: ['#ff9999', '#66b3ff', '#99ff99'],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
          },
        });
      }
    } else {
      console.error(
        `Impossibile ottenere il contesto 2D per il canvas ${chartId}`
      );
    }
  }

  searchPatient() {
    if (!this.searchedCodiceFiscale.trim()) {
      alert('Inserire un codice fiscale valido!');
      return;
    }
    console.log(this.searchedCodiceFiscale);
    // Cerca il paziente per codice fiscale
    this.pazienteService.getPazienteByCF(this.searchedCodiceFiscale).subscribe(
      (paziente) => {
        this.selectedPatient = paziente;
        console.log('PAZIENTE:' + paziente);
        let appuntamentiIds = paziente.appuntamentiIds;
        // Recupera gli appuntamenti del paziente
        this.appuntamentoService
          .getAppuntamentiByIds(appuntamentiIds)
          .subscribe((appuntamenti) => {
            this.patientAppointments = appuntamenti;

            // Genera il grafico per gli appuntamenti del paziente
            const patientAppointmentData = [
              appuntamenti.length, // Numero totale appuntamenti
              appuntamenti.filter((a) => a.trattamento).length, // Con trattamento
            ];

            this.createCharts(
              'patientAppointmentsChart',
              patientAppointmentData,
              ['Totali', 'Con Trattamento'],
              'patientAppointmentsChart'
            );
          });
      },
      (error) => {
        console.error('Paziente non trovato:', error);
        alert('Paziente non trovato!');
        this.selectedPatient = null;
        this.patientAppointments = [];
      }
    );
  }

  updateGeneralChart() {
    if (this.selectedParameter === 'stato') {
      // Calcola distribuzione per stato
      this.generalChartData = [
        this.numberOfPatientsInAttesa,
        this.numberOfPatientsCompleted,
        this.numberOfPatientsConclusi,
      ];
      this.createCharts(
        'generalChart',
        this.generalChartData,
        ['In attesa', 'Attivo', 'Concluso'],
        'patientChart'
      );
    } else if (this.selectedParameter === 'eta') {
      // Calcola distribuzione per età
      this.pazienteService.getPazienti().subscribe((pazienti: Paziente[]) => {
        const ageCounts = [0, 0, 0, 0]; // Inizializza i conteggi per ogni range di età
        const currentYear = new Date().getFullYear();

        pazienti.forEach((paziente) => {
          const birthYear = new Date(paziente.dataDiNascita).getFullYear();
          const age = currentYear - birthYear;

          if (age <= 18) ageCounts[0]++;
          else if (age <= 35) ageCounts[1]++;
          else if (age <= 60) ageCounts[2]++;
          else ageCounts[3]++;
        });

        this.generalChartData = ageCounts;
        this.createCharts(
          'generalChart',
          this.generalChartData,
          this.ageRanges,
          'patientChart'
        );
      });
    }
  }
}
