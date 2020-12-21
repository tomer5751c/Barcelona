import { Component, ViewChild } from '@angular/core';
import { SelectItem, SelectItemGroup, MessageService } from 'primeng/api';
import { DataViewModule } from 'primeng/dataview';
import { Dropdown } from 'primeng/dropdown';
import { DMLCustomersService } from './dmlcustomers.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})

export class AppComponent {
  @ViewChild('dataView') dataView;
  @ViewChild('sortDropdown') sortDropdown;

  games: any = [];
  loading: boolean;

  title: string;
  titleLogo: string;

  years: SelectItem[];
  selectedYear: string;

  groupedTeams: SelectItemGroup[];
  selectedCountry: string;
  selectedTeam: SelectItem;
  countriesCodes: any;

  searchInput: string;
  sortOptions:  SelectItem[];
  sortOptions1: SelectItem[];
  sortOptions2: SelectItem[];
  sortOrder: number;

  constructor(private data: DMLCustomersService, public messages: MessageService) {
    this.loading = true;

    this.selectedCountry = 'Spain';
    this.selectedTeam = { label: 'Barcelona', value: '83' };
    this.selectedYear = 'Upcoming';

    this.data.getCountriesFlags().subscribe(res => {
      this.countriesCodes = res;
      this.data.getTeams().subscribe(teams => {
        this.groupedTeams = Object.keys(teams).map(v=>{return {label:v,items:teams[v].teams}})
        debugger
        this.groupedTeams.forEach(v => v.value = this.countriesCodes[v.label]);
      });
      this.getGames();
    }, error => {
      console.log(error);
      this.printMessage('Error in Server Side');
      this.loading = false;
    });

    this.years = [];
    for (let i = 2000; i <= 2020; i++) {
      this.years.push({ label: 'year', value: i.toString() });
    }
    this.years.push({ label: 'year', value: 'Upcoming' });
  }

  ngOnInit() {
    this.sortOptions1 = [
      { label: 'Closest games first', value: 1 },
      { label: 'Latest games first', value: -1 }
    ];
    this.sortOptions2 = [
      { label: 'Latest games first', value: -1 },
      { label: 'Oldest games first', value: 1 }
    ];
  }

  printMessage(text) {
    this.messages.add({ severity: 'error', summary: 'Service Message', detail: text });
  }

  teamChange(event) {
    this.selectedTeam.label = event.originalEvent.toElement.textContent;
  }

  getGames(): void {
    this.dataView.filter('');
    this.searchInput = '';
    this.sortOrder = 0;
    this.loading = true;

    this.title = this.selectedTeam.label;
    this.titleLogo = this.selectedTeam.value;

    this.games = [];
    var year = this.selectedYear;

    this.sortOptions = (this.selectedYear === 'Upcoming')? this.sortOptions1 : this.sortOptions2;
    
    this.data.getGames(this.selectedTeam.value, year).subscribe(res => {
      this.games = (res);
      this.loading = false;
    }, error => {
      console.log(error);
      this.printMessage('Error in Server Side');
      this.loading = false;
    });
  }

  initializeTeamsID(): void {
    this.groupedTeams = [
      {
        label: 'Spain',
        items: [
          { label: 'Barcelona', value: '83' },
          { label: 'Real Madrid', value: '86' },
          { label: 'Atletico Madrid', value: '1068' },
          { label: 'Villarreal', value: '102' },
          { label: 'Real Sociedad', value: '89' },
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
          { label: 'Borussia Dortmund', value: '124' },
          { label: 'RB Leipzig', value: '11420' },
        ]
      },
      {
        label: 'France',
        items: [
          { label: 'Paris S.G', value: '160' },
          { label: 'Marseille', value: '176' },
          { label: 'Lyon', value: '167' },
        ]
      }
    ];
  }
}
