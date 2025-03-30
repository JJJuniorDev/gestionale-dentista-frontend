export class TreatmentEvent {
  id: string;
  public pianoTrattamentoId: string;
  descrizione: string;
  dataEOrario: string;
  deleted: boolean;
  tipologia: string;
  constructor(
    id: string,
    pianoTrattamentoId: string,
    descrizione: string,
    dataEOrario: string,
    deleted: boolean,
    tipologia: string
  ) {
    this.id = id;
    this.pianoTrattamentoId = pianoTrattamentoId;
    this.descrizione = descrizione;
    this.dataEOrario = dataEOrario;
    this.deleted = deleted;
    this.tipologia = tipologia;
  }
}
