
export class EventoDTO {
  public id: string;
  public pianoTrattamentoId: string;
  public descrizione: string;
  public dataScade: string;
  public deleted: boolean;
  public tipologia: string;
  public dottoreId: string;

  constructor(
    id: string,
    pianoTrattamentoId: string,
    descrizione: string,
    dataScade: string,
    deleted: boolean,
    tipologia: string,
    dottoreId: string
  ) {
    this.id = id;
    this.pianoTrattamentoId = pianoTrattamentoId;
    this.descrizione = descrizione;
    this.dataScade = dataScade;
    this.deleted = deleted;
    this.tipologia = tipologia;
    this.dottoreId = dottoreId;
  }
}