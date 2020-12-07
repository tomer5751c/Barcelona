import { Component, Input, OnInit } from '@angular/core';
import { DMLCustomersService } from '../app/dmlcustomers.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent {
  @Input() game;

  constructor(private data: DMLCustomersService, private dom: DomSanitizer) { }

  show(event): void {
    let id = '8Wtxez6E548';
    this.game.url = this.dom.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?controls=1`);
    return;
    if (!this.game.url){
      this.data.getVideoGame(this.game).subscribe(res => {
        id = res['videoId'];
        this.game.url = this.dom.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?controls=1`);
      });
    }
  }
  fun(event): void{
    alert('gggg');
  }
  onTabOpen(event): void {
    let id;
    if(!this.game.url){
      this.data.getVideoGame(this.game).subscribe(res => {
        id = res['videoId'];
        this.game.url = this.dom.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?controls=1`);
      });
    }
  }

}
