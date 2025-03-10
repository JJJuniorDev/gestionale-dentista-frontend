// appuntamento.dto.ts
import { Paziente } from '../pazienti/paziente.model';

export class AppuntamentoDTO {
  public id: string;
  public dataEOrario: Date;
  public codiceFiscalePaziente: string;
  public trattamento: string;
  public note: string;
  public pazienteId: string; // Dati del paziente
  public stato: string;
  public paziente: Paziente | undefined | null;
public dottoreId: string;

  constructor(
    id: string,
    dataEOrario: Date,
    codiceFiscalePaziente: string,
    trattamento: string,
    note: string,
    pazienteId: string,
    stato: string,
    paziente: Paziente | null,
    dottoreId: string 
  ) {
    this.id = id;
    this.dataEOrario = dataEOrario;
    this.codiceFiscalePaziente = codiceFiscalePaziente;
    this.trattamento = trattamento;
    this.note = note;
    this.pazienteId = pazienteId;
    this.stato = stato;
    this.paziente!=paziente;
    this.dottoreId=dottoreId;
  }
}
