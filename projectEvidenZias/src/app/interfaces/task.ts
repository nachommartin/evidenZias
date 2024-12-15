import { Status } from "../enums/status"
import { User } from "./user"

export interface Task {
  taskCode: string
  nameTask: string
  description: string
  observations: string
  status: Status
  createDate: string
  modifyDate: any
  oldAssignation: any
  supervisor: User
  assignations: User[]
}

export interface TaskRequest {
    nameTask: string
    description: string
    observations: string
    modifiedStatus: string
    supervisorCode: string
  }
