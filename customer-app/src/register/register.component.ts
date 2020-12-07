import { Component, Input, OnInit } from '@angular/core';
import { DMLCustomersService } from 'src/app/dmlcustomers.service';
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private data: DMLCustomersService) { }
  tiles: Tile[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];
  firstName: string;
  lastName: string;
  email:string
  // tslint:disable-next-line:typedef
  register(){
    console.log('register');
    const body = {firstName: this.firstName, lastName: this.lastName};
    this.data.insertCustomer(body);
  }
  ngOnInit(): void {
  }
  // tslint:disable-next-line:typedef
  inputFn(event){
    this.firstName = event.target.value;
  }
  inputLn(event){
    this.lastName = event.target.value;
  }
  inputEmail(event){
    this.email = event.target.value;
  }

}
