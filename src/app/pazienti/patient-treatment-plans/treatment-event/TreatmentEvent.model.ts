export class TreatmentEvent {
  id: string;
  public pianoTrattamentoId: string;
  descrizione: string;
  dataScade: string;
  deleted: boolean;
  tipologia: string;
  constructor(
    id: string,
    pianoTrattamentoId: string,
    descrizione: string,
    dataScade: string,
    deleted: boolean,
    tipologia: string
  ) {
    this.id = id;
    this.pianoTrattamentoId = pianoTrattamentoId;
    this.descrizione = descrizione;
    this.dataScade = dataScade;
    this.deleted = deleted;
    this.tipologia = tipologia;
  }
}
