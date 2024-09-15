import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  @ViewChild('appointmentsChart') appointmentsChart: BaseChartDirective | undefined;
  @ViewChild('patientsChart') patientsChart: BaseChartDirective | undefined;
  @ViewChild('serverChart') serverChart: BaseChartDirective | undefined;
  @ViewChild('comparisonChart') comparisonChart: BaseChartDirective | undefined;

  public comparisonData: ChartData<'pie'> = {
    labels: ['Totale Appuntamenti', 'Totale Pazienti', 'Carico Server'],
    datasets: [
      {
        label: 'Comparazione',
        data: [0, 0, 0], // Dati iniziali vuoti
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };


  public appointmentsData: ChartData<'bar'> = {
    labels: ['Totale', 'Per Dentista', 'Completati', 'Futuri'],
    datasets: [
      {
        label: 'Numero di Appuntamenti',
        data: [0, 0, 0, 0], // Dati di esempio
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Dati per il grafico dei pazienti
  public patientsData: ChartData<'bar'> = {
    labels: [
      'Totale Pazienti',
      'Nuovi Pazienti',
      'Recuperati',
      'Pazienti Attivi',
    ],
    datasets: [
      {
        label: 'Numero di Pazienti',
        data: [0, 20, 30, 40], // Dati iniziali vuoti
        backgroundColor: ['rgba(255, 159, 64, 0.2)'],
        borderColor: ['rgba(255, 159, 64, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Dati per il grafico server/browser
  public serverData: ChartData<'bar'> = {
    labels: ['Server Load', 'Browser Sessions', 'Response Time', 'Errors'],
    datasets: [
      {
        label: 'Performance Server/Browser',
        data: [10, 20, 30, 40], // Dati iniziali vuoti
        backgroundColor: ['rgba(153, 102, 255, 0.2)'],
        borderColor: ['rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef // Iniettare il ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointmentsStatistics();
    this.loadPatientsStatistics();
    this.loadServerStatistics();
  }

  loadAppointmentsStatistics() {
    const dentistaId = this.authService.getUserId();
    this.http
      .get<any>(
        `http://localhost:8081/api/statistics/appointments?dentistaId=${dentistaId}`
      )
      .subscribe(
        (data) => {
          console.log('Dati delle statistiche ricevuti:', data);
          this.appointmentsData.datasets[0].data = [
            data.totaleAppuntamenti,
            data.appuntamentiPerDentista,
            data.appuntamentiFuturi,
            data.appuntamentiCompletati,
          ];
          // Forzare il rilevamento delle modifiche
          this.cdRef.detectChanges();
          if (this.appointmentsChart) {
            this.appointmentsChart.update(); // Forza l'aggiornamento del grafico
            this.updateComparisonChart();
          }
        },
        (error) => {
          console.error('Errore nel caricamento delle statistiche:', error);
        }
      );
  }

  // Metodo per caricare i dati dei pazienti
  loadPatientsStatistics() {
    this.http
      .get<any>('http://localhost:8081/api/statistics/patients')
      .subscribe((data) => {
        this.patientsData.datasets[0].data = [
          data.totalePazienti || 0,
          data.nuoviPazienti || 0,
          data.pazientiRecuperati || 0,
          data.pazientiAttivi || 0,
        ];
        if (this.patientsChart) {
          this.patientsChart.update();
             this.updateComparisonChart();
        }
      });
  }

  // Metodo per caricare i dati del server/browser
  loadServerStatistics() {
    this.http
      .get<any>('http://localhost:8081/api/statistics/server')
      .subscribe((data) => {
        this.serverData.datasets[0].data = [
          data.serverLoad || 0,
          data.browserSessions || 0,
          data.responseTime || 0,
          data.errors || 0,
        ];
        if (this.serverChart) {
          this.serverChart.update();
             this.updateComparisonChart();
        }
      });
  }

  updateComparisonChart() {
  const totalAppointments = this.appointmentsData.datasets[0].data.reduce((a, b) => a + b, 0);
  const totalPatients = this.patientsData.datasets[0].data.reduce((a, b) => a + b, 0);
  const totalServerLoad = this.serverData.datasets[0].data[0]; // Supponiamo che il primo dato sia il carico del server

  this.comparisonData.datasets[0].data = [
    totalAppointments,
    totalPatients,
    totalServerLoad,
  ];
  
  if (this.comparisonChart) {
    this.comparisonChart.update();
  }
}
}
