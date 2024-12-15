import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';
import { Task, TaskRequest } from '../interfaces/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private taskUrl: string = environment.baseUrl+'/task'


  constructor(private http: HttpClient) { }

  //Métodos GET
  
  getAllTask(){
    return this.http.get<Task[]>(this.taskUrl)  
  }

  //Métodos POST

  saveTask(task: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.taskUrl, task)
  }

  assignTask(taskCode: string, userCode:string): Observable<Task> {
    const path = `${this.taskUrl}`+"/assign"
    const body={
      "userCode": userCode,
      "taskCode": taskCode
    }
    
    return this.http.post<Task>(path,body)
  }

  unassignTask(taskCode: string, userCode:string): Observable<Task> {
    const path = `${this.taskUrl}`+"/unassign"
    const body={
      "userCode": userCode,
      "taskCode": taskCode
    }
    
    return this.http.post<Task>(path,body)
  }

  //Métodos PUT

  updateTask(task: TaskRequest, taskCode: string): Observable<Task> {
    const path = `${this.taskUrl}`+"/"+taskCode;
    return this.http.put<Task>(path, task)
  }

}
