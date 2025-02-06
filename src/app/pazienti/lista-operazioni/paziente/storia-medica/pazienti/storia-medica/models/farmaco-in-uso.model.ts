import { AppuntamentoDTO } from "src/app/appuntamenti/appuntamentoDTO.model";

export interface FarmacoInUso {
  id: string; // ObjectId del documento FarmacoInUso
  nomeFarmaco: string; // Nome del farmaco (es. Lorazepam)
  dosaggio: string; // Dosaggio (es. 1mg)
  frequenza: string; // Frequenza (es. due volte al giorno)
  appuntamenti: string[];
  note: string[];
  durataAttuale: string;
}
