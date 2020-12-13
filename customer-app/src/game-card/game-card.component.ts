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
  
  onTabOpen(event): void {
    // let id= 'MR0-kfUqvXc';
    // this.game.url = this.dom.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?controls=1`);
    // return;
    if(!this.game.url){
      this.data.getVideoGame(this.game).subscribe(res => {
        let id = res['videoId'];
        this.game.url = this.dom.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?controls=1`);
      });
    }
  }

}
