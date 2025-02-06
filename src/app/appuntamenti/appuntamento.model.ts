
export class Appuntamento {
  public id: string;
  public dataEOrario: Date;
  public trattamento: string;
  public note: string;
  public pazienteId: string; // Usare l'ID del paziente invece del codice fiscale
  public stato: string;

  constructor(
    id: string,
    dataEOrario: Date,
    pazienteId: string,
    trattamento: string,
    note: string,
    stato: string
  ) {
    this.id = id;
    this.dataEOrario = dataEOrario;
    this.pazienteId = pazienteId;
    this.trattamento = trattamento;
    this.note = note;
    this.stato = stato;
  }
}