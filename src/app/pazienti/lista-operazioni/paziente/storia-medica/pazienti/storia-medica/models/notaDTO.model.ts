export interface NotaDTO {
  id: string;
  dataCreazione: Date;
  dataModifica: Date;
  contenuto: string;
  dottoreId: string;
  pazienteId: string | null;
  appuntamentoId: string | null;
  utente: string;
  tipoNota: string;
  priorita: string;
  visibilita: boolean;
}
