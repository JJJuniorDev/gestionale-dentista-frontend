
export class EventoDTO {
  public id: string;
  public pianoTrattamentoId: string;
  public descrizione: string;
  public dataEOrario: Date;
  public deleted: boolean;
  public tipologia: string;
  public dottoreId: string;

  constructor(
    id: string,
    pianoTrattamentoId: string,
    descrizione: string,
    dataEOrario: Date,
    deleted: boolean,
    tipologia: string,
    dottoreId: string
  ) {
    this.id = id;
    this.pianoTrattamentoId = pianoTrattamentoId;
    this.descrizione = descrizione;
    this.dataEOrario = dataEOrario;
    this.deleted = deleted;
    this.tipologia = tipologia;
    this.dottoreId = dottoreId;
  }
}