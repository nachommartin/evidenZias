import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl: string = environment.baseUrl+'/user'


  constructor(private http: HttpClient) { }


  //Métodos GET
  getUser(userCode:string){
    const path = `${this.userUrl}`+"/"+userCode;
    return this.http.get<User>(path);

  }

  getAllUsers(){
    return this.http.get<User[]>(this.userUrl)  
  }

  //Métodos POST

  saveUser(user: User): Observable<User> {
    return this.http.post<User>(this.userUrl, user)
  }

  //Mëtodos PUT

  updateUser(user: User, userCode: string): Observable<User> {
    const path = `${this.userUrl}`+"/"+userCode;
    return this.http.put<User>(path, user)
  }

  addAvatar(file: File, userCode: string):  Observable<any>   {
    const path = `${this.userUrl}`+"/"+userCode+"/image";
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<string>(path, formData)
  }

  //Métodos DELETE
  deleteUser(userCode: string)  {
    const path = `${this.userUrl}`+"/"+userCode;
    return this.http.delete<User>(path)
  }


  
}
