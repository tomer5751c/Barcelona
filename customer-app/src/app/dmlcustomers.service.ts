import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DMLCustomersService {
  url = 'http://localhost:3000';
  constructor(private http: HttpClient) { }
  // tslint:disable-next-line:typedef
  insertCustomer(body) {
    console.log('in servicce');
    try{
      this.http.post('http://localhost:3000/insertCustomer/', body).toPromise().then(res=>{
        console.log(res);
      }).catch(err => {
        console.log(err);

      });
    }
    catch (err){
      console.log(err);
    }

  }

  // tslint:disable-next-line:typedef
  getGames(year){
    return this.http.get(this.url + '/getData/?year=' + year);
  }
  // tslint:disable-next-line:typedef
  getVideoGame(game){
    const teams = `${game.name1} vs ${game.name2}`;
    const score = `${game.score1}-${game.score2}`;
    const year = new Date(game.date).getFullYear();
    return this.http.get(this.url + '/getVideo/?teamString=' + teams + '&score=' + score+'&year='+year);
  }
}


