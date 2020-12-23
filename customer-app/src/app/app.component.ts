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
  selectedTeam: string;
  countriesCodes: any;

  searchInput: string;
  sortOptions: SelectItem[];
  sortOptions1: SelectItem[];
  sortOptions2: SelectItem[];
  sortOrder: number;

  constructor(private data: DMLCustomersService, public messages: MessageService) {
    this.loading = true;

    this.selectedCountry = 'Spain';
    this.selectedTeam = '83';
    this.selectedYear = 'Upcoming';

    console.time('startCountries');
    this.data.getTeams().subscribe(countries => {
      console.timeEnd('startCountries');
      this.groupedTeams = Object.keys(countries).reverse().map(v => ({ value: countries[v].code, label: v, items: countries[v].teams }));
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
    this.messages.add({ severity: 'error', summary: 'Service Message', detail: text });
  }

  getGames(): void {
    this.dataView.filter('');
    this.searchInput = '';
    this.sortOrder = 0;
    this.loading = true;

    this.titleLogo = this.selectedTeam;
    const selectedTeam = document.getElementsByClassName('p-dropdown-clearable')[0];
    this.title = (!this.title) ? 'Barcelona' : selectedTeam.textContent;

    var year = this.selectedYear;
    this.sortOptions = (this.selectedYear === 'Upcoming') ? this.sortOptions1 : this.sortOptions2;

    this.games = [];
    this.data.getGames(this.selectedTeam, year).subscribe(res => {
      this.games = (res);
      this.loading = false;
    }, error => {
      console.log(error);
      this.printMessage('Error in Server Side');
      this.loading = false;
    });
  }

}
