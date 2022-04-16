export class Player {
  constructor(socket, name, id) {
    this.socket = socket;
    this.name = name;
    this.id = id;
    this.socket.setPlayerInstance(this);
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  closeWebSocket() {
    this.socket != null && this.socket.close();
  }

  sendBuffer(buffer) {
    this.socket.sendBuffer(buffer);
  }

  generateDTO(buffer) {
    buffer.writeInt(this.id, 1);
    buffer.writeString(this.name);
  }
}
