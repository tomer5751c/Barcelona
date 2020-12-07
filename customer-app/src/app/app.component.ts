import { Component } from '@angular/core';
import {DMLCustomersService} from './dmlcustomers.service';

interface Year {
  year: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  games: any;
  showOption = true;
  loading: boolean;

  years: Year[];
  selectedYear: Year;


  constructor(private data: DMLCustomersService){

    this.loading = false;

    this.years = [];
    for (let i = 2000; i <= 2020; i++){
      this.years.push({year: i + ''});
    }
    // this.selectedYear = this.years[0];
  }

  onclick(event): void {
    this.showOption = false;
  }

  getGames(): void {
    this.games = [];
    const year = this.selectedYear.year;
    this.loading = true;
    this.data.getGames(year).subscribe(res => {
      this.games = (res);
      this.loading = false;
      console.log(this.games);
    });
  }
}
