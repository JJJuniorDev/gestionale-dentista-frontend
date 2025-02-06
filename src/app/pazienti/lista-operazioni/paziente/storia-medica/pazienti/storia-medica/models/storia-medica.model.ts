import { AppuntamentoDTO } from 'src/app/appuntamenti/appuntamentoDTO.model';
import { Allergia } from './allergia.model';
import { FarmacoInUso } from './farmaco-in-uso.model';

export interface StoriaMedica {
  id: string; // ObjectId del documento StoriaMedica
  pazienteId: string; // ID del paziente associato
  allergie: Allergia[]; // Lista di allergie (embedded)
  farmaciInUso: FarmacoInUso[]; // Lista di farmaci in uso (embedded)
  anamnesi: string; // Note importanti
  controlloPeriodico: boolean; // Indica se è necessario un controllo periodico
  prossimoControllo: Date; // Data del prossimo controllo
    appuntamenti: AppuntamentoDTO[];
}
