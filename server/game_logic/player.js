import { Role } from "./role.js";

export class Player{

    constructor(socket, name, role){
        this.socket = socket;
        this.name = name;
        this.role = role;
    }

    updateRole(newRole){
        this.role = newRole;
        // TODO: Send message to websocket.
    }

    getRole(){
        return this.role;
    }

    getName(){
        return this.name;
    }
}