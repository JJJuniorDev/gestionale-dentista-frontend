import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Fattura } from '../fatturazione/fattura.model'; // importa il model
import { FatturazioneService } from '../fatturazione/fatturazione.service';
import { AppuntamentoDTO } from '../appuntamentoDTO.model';
import { AppuntamentoService } from '../appuntamento.service';

@Component({
  selector: 'app-fatturazione',
  templateUrl: './fatturazione.component.html',
  styleUrls: ['./fatturazione.component.css'],
})
export class FatturazioneComponent implements OnInit {
  fattura: Fattura | null = null;
  appuntamentoId: string | null = null;
  fatturaNotFound: boolean = false; // Nuova variabile per gestire il messaggio "Fattura non inserita"
  showFatturaForm: boolean = false; // Variabile per mostrare/nascondere il form
  newFattura: Fattura | undefined; // Variabile per i dati della nuova fattura
  appuntamento: AppuntamentoDTO | undefined;
  email: string = ''; // L'email dell'utente

  constructor(
    private route: ActivatedRoute,
    private fatturazioneService: FatturazioneService,
    private appuntamentoService: AppuntamentoService
  ) {}

  ngOnInit(): void {
    this.appuntamentoId = this.route.snapshot.paramMap.get('index');
    if (this.appuntamentoId) {
      console.log('Appuntamento ID trovato: ' + this.appuntamentoId);
      this.loadFattura();
    } else {
      console.error("Appuntamento ID non trovato nell'URL!");
    }
    //   this.appuntamentoId = this.route.snapshot.paramMap.get('index'); // Id dell'appuntamento
    // this.route.paramMap.subscribe((params) => {
    // this.appuntamentoId = params.get('index');
    // console.log("appuntamento ID "+this.appuntamentoId);
    //   this.loadFattura();
    // })
  }

  loadFattura(): void {
    console.log(
      'appuntamentoId in FatturazioneComponent: ',
      this.appuntamentoId
    );
    if (!this.appuntamentoId) return; // Verifica che appuntamentoId sia definito
    this.fatturazioneService
      .getFatturaByAppuntamentoId(this.appuntamentoId)
      .subscribe(
        (fattura) => {
          this.fattura = fattura;
          this.fatturaNotFound = false; // Resetta lo stato se la fattura è presente
        },
        (error) => {
          if (error.status === 404) {
            this.fatturaNotFound = true; // Nessuna fattura trovata per l'appuntamento
          } else {
            console.error('Errore nel recupero della fattura', error);
          }
        }
      );
    this.appuntamentoService
      .getAppuntamento(this.appuntamentoId)
      .subscribe((appuntamento) => {
        this.appuntamento = appuntamento;
      });
  }

  onCreateFattura(): void {
    if (!this.appuntamentoId) return;

    this.newFattura = {
      // Inizializzazione con valori predefiniti
      appuntamentoId: this.appuntamentoId,
      pazienteId: this.appuntamento!.pazienteId,
      nomePaziente: this.fattura!.nomePaziente,
      cognomePaziente: this.fattura!.cognomePaziente,
      costo: this.fattura!.costo,
    };
    this.showFatturaForm = true; // Mostra il modulo per inserire i dati della fattura
  }

  onSubmitFattura(): void {
    if (!this.appuntamentoId) return;

    this.fatturazioneService
      .createFattura(this.appuntamentoId, this.newFattura!)
      .subscribe(
        (fattura) => {
          this.fattura = fattura;
          alert('Fattura creata con successo');
          this.showFatturaForm = false; // Nasconde il modulo
        },
        (error) => console.error('Errore nella creazione della fattura', error)
      );
  }

  toggleFatturaForm(): void {
    if (!this.appuntamentoId) return;

    this.showFatturaForm = !this.showFatturaForm;

    // Inizializza `newFattura` quando il form viene mostrato
    if (this.showFatturaForm) {
      this.newFattura = {
        appuntamentoId: this.appuntamentoId,
        pazienteId: '',
        nomePaziente: '',
        cognomePaziente: '',
        costo: 0,
      };
    }
  }

  onUpdateFattura(): void {
    if (!this.fattura) return;

    this.fatturazioneService.updateFattura(this.fattura).subscribe(
      (fattura) => console.log('Fattura aggiornata', fattura),
      (error) => console.error("Errore nell'aggiornamento della fattura", error)
    );
  }

  // Metodo per inviare la fattura via email
  sendEmail(): void {
    if (!this.fattura || !this.email) return;

    this.fatturazioneService
      .sendEmail(this.appuntamentoId!, this.email)
      .subscribe(
        (response) => {
          alert('Fattura inviata via email');
        },
        (error) => {
          console.error("Errore nell'invio dell'email", error);
          alert("Errore nell'invio dell'email: " + error.message);
        }
      );
  }

  sendWhatsApp(): void {
     if (!this.appuntamentoId) {
       alert('ID appuntamento non trovato!');
       return;
     }
   const phoneNumber = prompt('Inserisci il numero WhatsApp del destinatario:');
  if (!phoneNumber) {
    alert('Numero di telefono non fornito!');
    return;
  }

  this.fatturazioneService
    .sendWhatsAppMessage(this.appuntamentoId, phoneNumber)
    .subscribe(
      (response) => {
        alert('Fattura inviata su WhatsApp con successo!');
      },
      (error) => {
        console.error('Errore durante l\'invio del messaggio WhatsApp:', error);
        alert('Errore durante l\'invio del messaggio WhatsApp: ' + error.message);
      }
    );
  }
}
