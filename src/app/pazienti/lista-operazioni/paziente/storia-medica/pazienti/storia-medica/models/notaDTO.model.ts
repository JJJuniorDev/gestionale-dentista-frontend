export interface NotaDTO {
  id: string;
  dataCreazione: Date;
  dataModifica: Date;
  contenuto: string;
  farmacoInUsoId: string;
  utente: string;
  tipoNota: string;
  priorita: string;
  visibilita: boolean;
}
