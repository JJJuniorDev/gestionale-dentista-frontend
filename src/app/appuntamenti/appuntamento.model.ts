import { Operazione } from "../operazioni/operazione.model";

export class Appuntamento {
  public id: string;
  public dataEOrario: Date;
  public codiceFiscalePaziente: string;
  public trattamento: string;
  public note: string;
  public operazioni: Operazione[];

  constructor(
    id: string,
    dataEOrario: Date,
    codiceFiscalePaziente: string,
    trattamento: string,
    note: string,
    operazioni: Operazione[]
  ) {
    this.id = id;
    this.dataEOrario = dataEOrario;
    this.codiceFiscalePaziente = codiceFiscalePaziente;
    this.trattamento = trattamento;
    this.note = note;
    this.operazioni = operazioni;
  }
}