import { AppuntamentoDTO } from "src/app/appuntamenti/appuntamentoDTO.model";
import { TreatmentEvent } from "./treatment-event/TreatmentEvent.model";

export class PatientTreatmentPlan {
  public id: string; // Identificativo unico del piano
  public pazienteId: string; // ID del paziente associato
  public nomePiano: string; // Nome del piano
  public attivo: boolean; // Stato di attivazione del piano
  public dataInizio: string; // Data di inizio del piano
  public dataFine: string; // Data di fine del piano
  public appuntamenti: AppuntamentoDTO[]; // Lista delle tappe del piano
  public eventi: TreatmentEvent[];
  constructor(
    id: string,
    pazienteId: string,
    nomePiano: string,
    attivo: boolean,
    dataInizio: string,
    dataFine: string,
    appuntamenti: AppuntamentoDTO[],
    eventi: TreatmentEvent[]
  ) {
    this.id = id;
    this.pazienteId = pazienteId;
    this.nomePiano = nomePiano;
    this.attivo = attivo;
    this.dataInizio = dataInizio;
    this.dataFine = dataFine;
    this.appuntamenti = appuntamenti;
    this.eventi = eventi;
  }
}
