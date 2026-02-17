const socket = new WebSocket("ws://localhost:3001");

socket.onmessage = (mess) => {
    console.log(mess.data);
};