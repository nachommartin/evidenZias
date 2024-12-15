import { Component } from '@angular/core';
import { TaskService } from './services/task.service';
import { Task, TaskRequest } from './interfaces/task';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Status } from './enums/status';
import { transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { User } from './interfaces/user';
import { UserService } from './services/user.service';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService]
})
export class AppComponent {
  title = 'projectEvidenZias';
  completedTasks:Task[]=[];
  cancelledTasks:Task[]=[];
  inProgressTasks:Task[]=[]
  pendingTasks:Task[]=[]
  testingTasks:Task[]=[]
  allTasks:Task[]=[]
  allUsers: User[]=[]
  usersToAssign: User[]=[]
  usersToUnassign: User[]=[]
  menuItems: any[] = []; 
  userCodeSelected!:string
  taskSelected!:Task;
  userShowed!:User;
  dialog!:boolean;
  dialogAssign!:boolean;
  dialogUnassign!:boolean;
  dialogCreate!:boolean
  dialogUser!:boolean
  formGroup!: FormGroup;
  formGroupAssignation!:FormGroup

  constructor(private taskService:TaskService, private userService: UserService, private formBuilder: FormBuilder, private messageService:MessageService) { }


  ngOnInit(): void {
    this.loadTasks();
    this.buildForm();
    this.buildFormAssignation()
    this.loadUsers()
  }
    

  loadTasks(){
    this.taskService.getAllTask().subscribe((resp) => {
      this.allTasks = resp;
      this.organizeAndSortTasks(this.allTasks);
    });
  }

  loadUsers(){
    this.userService.getAllUsers().subscribe((resp) => {
      this.allUsers = resp;
      this.menuItems = this.allUsers.map(user => ({
        label: user.nameUser, 
        command: () => this.showUser(user) 
      }));
    });
  }

  selectOption(option:string) {
    this.userCodeSelected=option;
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    console.log(event)
    if (event.previousContainer !== event.container) {
      if(event.previousContainer.id=='Completed' || event.previousContainer.id=='Cancelled'){
        this.messageService.add({key: 'notToPast', severity:'error', summary:'Error', detail:'La tarea esta en un estado final y no se puede revertir'});
      }
      else{
      // Actualizar el status basado en el contenedor destino
      const task = event.previousContainer.data[event.previousIndex];
      const targetContainerId = event.container.id;
      let newStatus: Status;

      switch (targetContainerId) {
        case 'Pending':
          newStatus = Status.PENDING;
          break;
        case 'InProgress':
          newStatus = Status.IN_PROGRESS;
          break;
        case 'Testing':
            newStatus = Status.TESTING;
            break;
        case 'Completed':
          newStatus = Status.COMPLETED;
          break;
        case 'Cancelled':
          newStatus = Status.CANCELED;
          break;
        default:
          console.error('Destino desconocido para la tarea');
          return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    task.status=newStatus
    // Actualizar el estado de la tarea en el servidor
    this.updateTaskStatus(task);
  }
}
  else {
    this.messageService.add({key: 'notMove', severity:'warn', summary:'Atención', detail:'La tarea no ha cambiado de estado'});
  }
}

 
  // Función para actualizar el estado de la tarea en el servidor
  private updateTaskStatus(task: Task) {
    const request: TaskRequest = {
      nameTask: task.nameTask,
      description: task.description,
      observations: task.observations,
      modifiedStatus: task.status,
      supervisorCode: task.supervisor.userCode
      
      }
    this.taskService.updateTask(request, task.taskCode)
      .subscribe(response => {
        this.messageService.add({key: 'okServer', severity:'success', summary:'Acción realizada', detail:'La tarea ha cambiado de estado'});
      }, error => {
        console.error(error)
        this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:error.error.message});
    
      });
  }

  // Método para ordenar las tareas por su status dentro de cada lista
  organizeAndSortTasks(allTasks: Task[]) {
    // Vaciar los listados existentes para evitar duplicados
    this.pendingTasks = [];
    this.inProgressTasks = [];
    this.completedTasks = [];
    this.cancelledTasks = [];
  
    // Clasificar las tareas por su estado
    allTasks.forEach(task => {
      switch (task.status) {
        case Status.PENDING:
          this.pendingTasks.push(task);
          break;
        case Status.IN_PROGRESS:
          this.inProgressTasks.push(task);
          break;
        case Status.TESTING:
            this.testingTasks.push(task);
            break;
        case Status.COMPLETED:
          this.completedTasks.push(task);
          break;
        case Status.CANCELED:
          this.cancelledTasks.push(task);
          break;
        default:
          console.warn(`Estado desconocido para la tarea: ${task}`);
      }
    });
  
    // Ordenar cada lista por el status si es necesario
    this.sortTasksByStatus();
  }
  
  sortTasksByStatus() {
    this.pendingTasks.sort((a, b) => this.compareStatus(a.status, b.status));
    this.inProgressTasks.sort((a, b) => this.compareStatus(a.status, b.status));
    this.testingTasks.sort((a, b) => this.compareStatus(a.status, b.status));
    this.completedTasks.sort((a, b) => this.compareStatus(a.status, b.status));
    this.cancelledTasks.sort((a, b) => this.compareStatus(a.status, b.status));
  }
  
  compareStatus(statusA: Status, statusB: Status): number {
    const order = [Status.PENDING, Status.IN_PROGRESS, Status.TESTING, Status.COMPLETED, Status.CANCELED];
    return order.indexOf(statusA) - order.indexOf(statusB);
  }

// Función para actualizar la tarea  
updateTask(){
  const formValues = this.formGroup.value;

  // Verifica cada campo y usa el valor por defecto si el campo es nulo 
  const task = {
    nameTask: formValues.nameTask ?? this.taskSelected.nameTask,
    description: formValues.description ?? this.taskSelected.description,
    observations: formValues.observations ?? this.taskSelected.observations,
    modifiedStatus: this.taskSelected.status,
    supervisorCode: formValues.supervisorCode ?? this.taskSelected.supervisor.userCode,
  }
  this.taskService.updateTask(task, this.taskSelected.taskCode).subscribe({
  next: (resp => {
    this.loadTasks();
    this.buildForm();   
    this.showForm(); 
    this.messageService.add({key: 'okServer', severity:'success', summary:'Acción realizada', detail:'La tarea se ha actualizado'});
    }),
  error: resp=> {
    this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:resp.error.message});
  }
  })
}

// Función para asignar la tarea  
assignTask(){
  const formValues = this.formGroupAssignation.value;

 
  this.taskService.assignTask(this.taskSelected.taskCode,formValues.userCode).subscribe({
  next: (resp => {
    this.loadTasks();
    this.buildForm();   
    this.showFormAssign(); 
    this.messageService.add({key: 'okServer', severity:'success', summary:'Acción realizada', detail:'La tarea se ha asignado'});
    }),
  error: resp=> {
    console.error(resp)
    this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:resp.error.message});
  }
  })
}

// Función para asignar la tarea  
unassignTask(){
  const formValues = this.formGroupAssignation.value;

 
  this.taskService.unassignTask(this.taskSelected.taskCode,formValues.userCode).subscribe({
  next: (resp => {
    this.loadTasks();
    this.buildFormAssignation();   
    this.showFormAssign(); 
    this.messageService.add({key: 'okServer', severity:'success', summary:'Acción realizada', detail:'La tarea se ha desasignado'});
    }),
  error: resp=> {
    console.error(resp)
    this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:resp.error.message});
  }
  })
}

//Función de crear tarea
createTask(){
  const formValues = this.formGroup.value;
  if(formValues.nameTask==null){
    this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:'La tarea debe tener un título'});
    return
  }
  if(formValues.description==null){
    this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:'La tarea debe tener una descripción'});
    return
  }
  if(formValues.supervisorCode==null){
    this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:'La tarea debe tener un/a supervisor/a'});
    return
  }
    // El Status es Pendiente por defecto
   const task = {
     nameTask: formValues.nameTask,
     description: formValues.description, 
     observations: formValues.observations ?? null,
     modifiedStatus: Status.PENDING,
     supervisorCode: formValues.supervisorCode 
   }
   this.taskService.saveTask(task).subscribe({
    next: (resp => {
      this.loadTasks();
      this.buildForm();   
      this.createForm(); 
      this.messageService.add({key: 'okServer', severity:'success', summary:'Acción realizada', detail:'La tarea se ha creado'});
      }),
    error: resp=> {
      this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:resp.error.message});
    }
    })  

}
//Función para mostrar las tareas asignadas
showUser(user:User){
  this.dialogUser=!this.dialogUser
  this.userService.getUser(user.userCode).subscribe({
    next: (resp => {
      this.userShowed=resp
      }),
    error: resp=> {
      console.error(resp)
      this.messageService.add({key: 'errorServer', severity:'error', summary:'Error', detail:resp.error.message});
    }
    })


}

createForm(){
  this.dialogCreate = !this.dialogCreate;
}


buildForm(){
  this.formGroup = this.formBuilder.group({
    nameTask: [],
    description: [],
    observations: [],
    supervisorCode: []
  }       
  )
}

selectTaskToEdit(task:Task){
  this.showForm();
  this.taskSelected = task;
}

selectTaskToAssign(task:Task){
  this.showFormAssign();
  this.taskSelected = task;
  this.usersToAssign = this.allUsers.filter(
    user => !task.assignations.some(assignation => assignation.userCode === user.userCode)
  );
}

selectTaskToUnassign(task:Task){
  this.showFormUnassign();
  this.taskSelected = task;
  this.usersToUnassign=task.assignations
}

showForm() {
  this.dialog = !this.dialog;
}

showFormAssign() {
  this.dialogAssign= !this.dialogAssign;
}

showFormUnassign() {
  this.dialogUnassign= !this.dialogUnassign;
}

buildFormAssignation(){
  this.formGroupAssignation = this.formBuilder.group({
    userCode: []
  }       
  )
}
  
    



}
