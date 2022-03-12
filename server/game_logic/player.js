export class Player {
  constructor(socket, name, id) {
    this.socket = socket;
    this.name = name;
    this.id = id;
    this.socket.setPlayerInstance(this);
  }

  sendPayload(name, payload) {
    this.socket.sendResponse(name, payload);
  }


  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  closeWebSocket() {
    this.socket.close();
  }

  generateDTO() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
