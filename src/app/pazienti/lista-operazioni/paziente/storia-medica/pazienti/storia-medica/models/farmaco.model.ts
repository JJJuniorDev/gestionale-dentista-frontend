// farmaco.model.ts
export interface Farmaco {
  nomeFarmaco: string; // Nome del farmaco
  categoria: string; // Categoria del farmaco (es. Ansiolitico)
  classeTerapeutica: string; // Classe terapeutica del farmaco
  principioAttivo: string; // Principio attivo del farmaco
  indicazioni: string[]; // Indicazioni terapeutiche
  controindicazioni: string[]; // Controindicazioni
  effettiCollaterali: string[]; // Effetti collaterali
  interazioni: string[]; // Interazioni con altri farmaci
  dataCreazione: string; // Data di creazione del farmaco
  dataAggiornamento: string; // Data di aggiornamento del farmaco
}
