
export class EventoDTO {
    public id: string;
    public pianoTrattamentoId: string;
    public descrizione: string; 
    public dataScade: string;
    public completata: boolean;
    public tipologia: string;
    public dottoreId: string;

    constructor(
        id: string, 
        pianoTrattamentoId: string,
 descrizione: string,
  dataScade: string,
   completata: boolean,
    tipologia: string,
     dottoreId: string){
        this.id= id;
        this.pianoTrattamentoId=pianoTrattamentoId;
        this.descrizione= descrizione;
        this.dataScade= dataScade;
        this.completata= completata;
        this.tipologia= tipologia;
        this.dottoreId= dottoreId;
    }
}