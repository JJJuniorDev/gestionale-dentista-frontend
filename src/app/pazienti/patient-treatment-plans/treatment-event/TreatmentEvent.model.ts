export class TreatmentEvent {
  id: string;
  public pianoTrattamentoId: string;
  descrizione: string;
  dataScade: string;
  completata: boolean;
tipologia: string;
  constructor(
    id: string,
    pianoTrattamentoId: string,
    descrizione: string,
    dataScade: string,
    completata: boolean,
    tipologia: string
  ) {
    this.id = id;
    this.pianoTrattamentoId=pianoTrattamentoId;
    this.descrizione = descrizione;
    this.dataScade = dataScade;
    this.completata = completata;
    this.tipologia= tipologia;
  }
}
