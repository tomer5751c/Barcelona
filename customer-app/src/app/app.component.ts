import { Component } from '@angular/core';
import { SelectItem, SelectItemGroup } from 'primeng/api';
import { DMLCustomersService } from './dmlcustomers.service';

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
  countriesCodes: any;
  years: SelectItem[];
  selectedYear: string;

  groupedTeams: SelectItemGroup[];
  selectedTeam: string;
  selectedCountry: string;
  constructor(private data: DMLCustomersService) {

    this.loading = false;
    this.selectedCountry = 'Spain';
    this.selectedTeam = 'Barcelona';
    this.selectedYear = '2020';
    
    this.data.getCountriesFlags().subscribe(res => {
      this.countriesCodes = res;
      this.initializeTeamsID();
      this.groupedTeams.forEach(v => v.value = this.countriesCodes[v.label]);
      this.getGames();
    });

    this.years = [];
    for (let i = 2000; i <= 2020; i++) {
      this.years.push({label: 'year', value:  i.toString()});
    }

  }

  onclick(event): void {
    this.showOption = false;
  }

  getGames(): void {
    this.loading = true;  
    
    //Search the team ID
    var teamID = '';
    this.groupedTeams.forEach(country =>{
      country.items.forEach(team => {
        if (team.label === this.selectedTeam) 
        teamID = team.value;
      })
    });
    
    this.games = [];
    var year = this.selectedYear;
    this.data.getGames(teamID, year).subscribe(res => {
      this.games = (res);
      this.loading = false;
    });
  }

  initializeTeamsID() : void {    
    this.groupedTeams = [
      {
        label: 'Spain',
        items: [
          { label: 'Barcelona', value: '83' },
          { label: 'Real Madrid', value: '86' },
          { label: 'Atletico Madrid', value: '1068' },
        ]
      },
      {
        label: 'Italy',
        items: [
          { label: 'Juventus', value: '111' },
          { label: 'AC Milan', value: '103' },
          { label: 'AS Roma', value: '104' },
        ]
      },
      {
        label: 'England', 
        items: [
          { label: 'Liverpool', value: '364' },
          { label: 'Chelsea', value: '363' },
          { label: 'Manchester City', value: '382' },
          { label: 'Manchester United', value: '360' },
          { label: 'Tottenham Hotspur', value: '367' },
          { label: 'Arsenal', value: '359' }
        ]
      },
      {
        label: 'Germany',
        items: [
          { label: 'Bayern Munich', value: '132' },
          { label: 'Borussia Dortmund', value: '124'},
          { label: 'RB Leipzig', value: '11420'},
        ]
      },
      {
        label: 'France',
        items: [
          { label: 'Paris S.G', value: '160' },
          { label: 'Marseille', value: '176'},
          { label: 'Lyon', value: '167'},
        ]
      }
    ];
  }
}
