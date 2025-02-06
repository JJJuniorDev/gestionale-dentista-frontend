import { Materiale } from "../shared/materiale.module";

export class Paziente {
  public id: string;
  public nome: string;
  public cognome: string;
  public codiceFiscale: string; //es. pulizia, ortodonzia, chirurgia
  public dataDiNascita: Date;
  public sesso: string; //durata in minuti
  //public strumentiNecessari?: Strumento[];
  public indirizzo: string;
  public numeroDiCellulare: string;
  public dottoreId: string; //usare User
  public appuntamentiIds: string[]; // Aggiungi questo campo

  constructor(
    id: string,
    nome: string,
    cognome: string,
    codiceFiscale: string,
    dataDiNascita: Date,
    sesso: string,
    indirizzo: string,
    numeroDiCellulare: string,
    dottoreId: string,
    appuntamentiIds: string[]
  ) {
    this.id = id;
    this.nome = nome;
    this.cognome = cognome;
    this.codiceFiscale = codiceFiscale;
    this.dataDiNascita = dataDiNascita;
    this.sesso = sesso;
    this.indirizzo = indirizzo;
    this.numeroDiCellulare = numeroDiCellulare;
    this.dottoreId = dottoreId;
    this.appuntamentiIds = appuntamentiIds;
  }
}