import { Materiale } from "../shared/materiale.module";

export class Operazione {
  public id: string;
  public nome: string;
  public prezzo: number;
  public categoria?: string; //es. pulizia, ortodonzia, chirurgia
  public durata?: number; //durata in minuti
  //public strumentiNecessari?: Strumento[];
  public materialiNecessari?: Materiale[];
  public note?: string;
  public responsabile: string; //usare User
  public data: Date;
  stato?: string;
  pazienteId: number; //ID paziente associato

  constructor(
    id: string,
    nome: string,
    prezzo: number,
    responsabile: string,
    data: Date,
    pazienteId: number
  ) {
    this.id = id;
    this.nome = nome;
    this.prezzo = prezzo;
    this.responsabile = responsabile;
    this.data = data;
    this.pazienteId = pazienteId;
  }
}