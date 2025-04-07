export class VideochiamataDTO {
  id: string;
  link: string;
  dataChiamata: string;
  dottoreId: string;
  pazienteId: string;

  constructor(
    id: string,
    link: string,
    dataChiamata: string,
    dottoreId: string,
    pazienteId: string)
    {
        this.id=id;
        this.link=link;
        this.dataChiamata=dataChiamata;
        this.dottoreId=dottoreId;
        this.pazienteId=pazienteId;
    }
}
