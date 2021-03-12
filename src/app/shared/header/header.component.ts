import { TokenService } from './../../services/token.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AccountApiService } from '../../services/account-api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isNotification:boolean = false
  constructor(
    private router: Router,
    private account: AccountApiService,
    private token: TokenService,
  ) { }

  ngOnInit(): void {
  }

   showNotification(){
     this.isNotification = !this.isNotification
   }

   logout(){
    this.account.logout().subscribe(
      (response) => {
        console.log(response);
        this.token.remove();
        //this.router.navigate(['login']);
        let objToSend: NavigationExtras = {
          queryParams: {
            success: response.success,
            message: response.message
          }
        };
        this.router.navigate(['login'], {
          state: objToSend
        });
        //this.router.navigate(['login'], {queryParams: { logout: 'true' } });
      },
      (err) => {
        console.log(err);
        if(err.error.code == 113){
          this.token.remove();
          let objToSend: NavigationExtras = {
            queryParams: {
              success: true,
              message: "Logged out successfully!"
            }
          };
          this.router.navigate(['login'], {
            state: objToSend
          });
          //this.router.navigate(['login'], {queryParams: { logout: 'true' } });
        }
      }
    );
   }


}
