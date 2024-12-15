import { Task } from '../interfaces/task';

export interface User {
  userCode: string
  nameUser: string
  surnameUser: string
  das: string
  isAdmin: boolean
  avatar: any
  tasks: Task[]
}
