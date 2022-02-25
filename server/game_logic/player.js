import { Role } from "./role.js";

export class Player{

    constructor(socket, name, id){
        this.socket = socket;
        this.name = name;
        this.id = id;
        this.role = Role.IDLE;
        this.socket.setPlayerInstance(this);
    }

    sendPayload(name, payload){
        this.socket.sendResponse(name, payload);
    }

    updateRole(newRole, nonUpdate){
        this.role = newRole;

    }

    canMakeGuess(){
        return this.role == Role.GUESSING;
    }

    getRole(){
        return this.role;
    }

    getName(){
        return this.name;
    }

    getId(){
        return this.id;
    }

    closeWebSocket(){
        this.socket.close();
    }

    generateDTO(){
        return {
            id: this.id,
            name: this.name,
            role: this.role
        }
    }
}