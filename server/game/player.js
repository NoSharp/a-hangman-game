import { Role } from "./role";

export class Player{

    constructor(socket, gameCookie, name, role){
        this.socket = socket;
        this.gameCookie = gameCookie;
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