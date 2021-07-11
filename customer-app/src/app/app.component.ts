import { Component, ViewChild } from '@angular/core';
import { SelectItem, SelectItemGroup, MessageService } from 'primeng/api';
import { DMLCustomersService } from './dmlcustomers.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})

export class AppComponent {
  @ViewChild('dataView') dataView;

  games: any = [];
  loading: boolean;

  title: string;
  titleLogo: string;

  years: SelectItem[];
  selectedYear: string;

  groupedTeams: SelectItemGroup[];
  selectedCountry: string;
  selectedTeamID: string;
  leagueCodes: SelectItem[];

  searchInput: string;
  sortOptions: SelectItem[];
  sortOptions1: SelectItem[];
  sortOptions2: SelectItem[];
  sortOrder: number;

  constructor(private data: DMLCustomersService, public messages: MessageService) {
    this.loading = true;

    this.selectedTeamID = '83';
    this.selectedYear = 'Upcoming';

    console.time('CountriesTime');
    this.data.getTeams().subscribe(countries => {
      console.timeEnd('CountriesTime');
      this.groupedTeams = Object.keys(countries).reverse().map(c => ({ value: countries[c].code,label: c,items: countries[c].teams, league: countries[c].league}));
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

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit(): void {
    this.sortOptions1 = [
      { label: 'Closest games first', value: 1 },
      { label: 'Latest games first', value: -1 }
    ];
    this.sortOptions2 = [
      { label: 'Latest games first', value: -1 },
      { label: 'Oldest games first', value: 1 }
    ];
  }

  printMessage(text): void {
    this.messages.add({ severity: 'error', summary: 'Service Message', detail: text});
  }

  getGames(): void {
    this.dataView.filter('');
    this.searchInput = '';
    this.sortOrder = 0;
    this.loading = true;

    //Selected Team
    this.titleLogo = this.selectedTeamID;
    const selectedTeam = document.getElementsByClassName('p-dropdown-clearable')[0].textContent;
    this.title = (!this.title) ? 'Barcelona' : selectedTeam;

    //Selected Year
    var year = this.selectedYear;
    this.sortOptions = (this.selectedYear === 'Upcoming') ? this.sortOptions1 : this.sortOptions2;

    //Selected League
    var league = (Object)(this.groupedTeams.find(country => country.items.find(team => team.label==selectedTeam))).league;

    this.games = [];
    this.data.getGames(this.selectedTeamID, year, league).subscribe(res => {
      this.games = (res);
      this.loading = false;
    }, error => {
      console.log(error);
      this.printMessage('Error in Server Side');
      this.loading = false;
    });
  }

}
