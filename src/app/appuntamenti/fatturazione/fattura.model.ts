export class Fattura {
  public fatturaId?: string; // Lasciandolo opzionale per quando crei una nuova fattura
  public appuntamentoId?: string;
  public pazienteId: string;
  public nomePaziente: string;
  public cognomePaziente: string;
  public costo: number;

  constructor(
    fatturaId: string = '',
    appuntamentoId: string = '',
    pazienteId: string = '',
    nomePaziente: string = '',
    cognomePaziente: string = '',
    costo: number = 0
  ) {
    this.fatturaId = fatturaId;
    this.appuntamentoId = appuntamentoId;
    this.pazienteId = pazienteId;
    this.nomePaziente = nomePaziente;
    this.cognomePaziente = cognomePaziente;
    this.costo = costo;
  }
}