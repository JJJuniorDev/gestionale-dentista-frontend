export class Allegato {
  public id: string;
  public nomeFile: string;
  public tipoFile: string;
  public contenuto: Uint8Array;
  public dottoreId: string;
  public pazienteId: string;
  public dataCaricamento: Date;

  constructor(
    id: string,
    nomeFile: string,
    tipoFile: string,
    contenuto: Uint8Array,
    dottoreId: string,
    pazienteId: string,
    dataCaricamento: Date
  ) {
    this.id = id;
    this.nomeFile = nomeFile;
    this.tipoFile = tipoFile;
    this.contenuto = contenuto;
    this.dottoreId = dottoreId;
    this.pazienteId = pazienteId;
    this.dataCaricamento = dataCaricamento;
  }
}