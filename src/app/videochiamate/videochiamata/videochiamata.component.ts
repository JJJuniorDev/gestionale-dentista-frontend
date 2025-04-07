import { Component } from '@angular/core';
import { VideochiamataService } from '../videochiamata.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Peer from 'peerjs';
import { VideochiamataDTO } from '../videochiamataDTO.mode';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-videochiamata',
  templateUrl: './videochiamata.component.html',
  styleUrls: ['./videochiamata.component.css'],
})
export class VideochiamataComponent {
  linkVideochiamata: string = '';
  dataChiamata: string = '';
  dottoreId: string | undefined; // ID del dottore
  pazienteId: string = ''; // ID del paziente
  videoCallActive: boolean = false; // Stato per monitorare se la videochiamata è attiva
  videoCall: any; // Per visualizzare i dettagli della videochiamata
  // 🔹 Variabili per PeerJS
  myPeer: Peer | undefined; // Per gestire la connessione PeerJS
  isCaller: boolean = false; // Per capire se è il dottore o il paziente
  localStream: MediaStream | undefined; // Per salvare il flusso video/audio
  remotePeerId: string | undefined; // 🔹 Nuova variabile per il paziente

  constructor(
    private videochiamataService: VideochiamataService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.dottoreId! = user.id;
      }
    });

    this.route.paramMap.subscribe((params) => {
      const link = params.get('link');
      if (link) {
        this.linkVideochiamata = link;

        this.videochiamataService.getVideochiamata(link).subscribe(
          (response: VideochiamataDTO) => {
            this.videoCall = response;
            this.videoCallActive = true;

            this.isCaller = this.dottoreId === response.dottoreId;
            this.initializePeer();
          },
          (error) => {
            console.error(
              'Errore nel recupero dei dettagli della videochiamata:',
              error
            );
          }
        );
      }
    });
  }

  creaVideochiamata() {
    this.videochiamataService
      .creaVideochiamata(this.dottoreId!, this.dataChiamata)
      .subscribe(
        (response: VideochiamataDTO) => {
          this.linkVideochiamata = `${window.location.origin}/videochiamata/${response.link}`;
          // Redirigi alla pagina della videochiamata appena creata
          this.router.navigate([`/videochiamata/${response.link}`]);
        },
        (error) => {
          console.error('Errore nella creazione della videochiamata', error);
        }
      );
  }

  initializePeer(): void {
    // Genera un ID Peer unico basato sul ruolo
    this.myPeer = new Peer();

    // 🔹 Avvia la webcam
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localStream = stream;
        this.addVideoStream(stream, 'local'); // Mostra il video locale

        this.myPeer!.on('open', (id) => {
          console.log(`PeerJS ID: ${id}`);
          if (this.isCaller) {
            console.log('Dottore in attesa di connessione...');
            // Il dottore è in attesa della connessione del paziente
          } else {
            this.remotePeerId = id;
            console.log('Paziente connesso, pronto a ricevere chiamata.');
            // Paziente invia il proprio ID PeerJS al dottore
            const conn = this.myPeer!.connect(
              'dottore-' + this.linkVideochiamata
            );
            conn.on('open', () => {
              conn.send(this.myPeer!.id);
            });
          }
        });

        // 🔹 Gestione della connessione
        this.myPeer!.on('connection', (conn) => {
          conn.on('data', (data) => {
            console.log('ID ricevuto dal paziente:', data);
            this.remotePeerId = data as string;
            this.startCall(); // Avvia la chiamata quando il paziente si connette
          });
        });

        // 🔹 Gestione della chiamata
        this.myPeer!.on('call', (call) => {
          call.answer(this.localStream!);
          call.on('stream', (remoteStream) => {
            this.addVideoStream(remoteStream, 'remote'); // Mostra il video remoto
          });
          console.log('Flusso remoto ricevuto');
        });

        // Paziente invia il suo ID peer
        if (!this.isCaller) {
          setTimeout(() => {
            const conn = this.myPeer!.connect(
              'dottore-' + this.linkVideochiamata
            );
            conn.on('open', () => {
              conn.send(this.myPeer!.id);
            });
          }, 1000);
        }
      })
      .catch((err) => console.error('Errore accesso webcam:', err));
  }

  startCall(): void {
    if (this.isCaller && this.remotePeerId) {
      console.log('Chiamata avviata verso:', this.remotePeerId);
      const call = this.myPeer!.call(this.remotePeerId, this.localStream!);
      call.on('stream', (remoteStream) =>
        this.addVideoStream(remoteStream, 'remote')
      );
    }
  }

  addVideoStream(stream: MediaStream, type: string): void {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.play();

    // Aggiungi il video in un contenitore specifico per ogni tipo
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoElement.className = type; // Classifica come 'local' o 'remote'
      videoContainer.appendChild(videoElement);
    }
  }

  endVideoCall(): void {
    this.videoCallActive = false;
    // Se usi WebRTC o PeerJS, fermare il flusso video:
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((video) => {
      //   const stream = video.srcObject;
      const stream = video.srcObject as MediaStream; // Assicurati che sia un MediaStream
      if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    });
    console.log('Videochiamata terminata!');
  }

  copyLink() {
    navigator.clipboard
      .writeText(this.linkVideochiamata)
      .then(() => alert('Link copiato!'))
      .catch((err) => console.error('Errore nella copia del link:', err));
  }
}
