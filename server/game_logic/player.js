import { Role } from "./role.js";

export class Player{

    constructor(socket, name){
        this.socket = socket;
        this.name = name;
        this.role = Role.IDLE;
    }

    sendPayload(name, payload){
        this.socket.sendResponse(name, payload);
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

    serialize(){
        return {
            name: this.name,
            role: this.role
        }
    }
}