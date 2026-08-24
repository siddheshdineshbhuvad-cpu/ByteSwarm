class WebSocketService {

    constructor() {
        this.socket = null;
        this.clientId = null;
    }

    connect() {

        this.clientId = "worker-" + crypto.randomUUID();

        console.log("Worker ID:", this.clientId);

        this.socket = new WebSocket("ws://localhost:8080/worker-ws");
        this.socket.onopen = () => {

            console.log("Connected to ByteSwarm backend");

            const registrationMessage = {
                type: "REGISTER",
                clientId: this.clientId,
                status: "AVAILABLE"
            };

            this.socket.send(JSON.stringify(registrationMessage));

            console.log(
                "Worker registered:",
                registrationMessage
            );
        };

        this.socket.onmessage = (event) => {

            console.log(
                "Message from backend:",
                event.data
            );
        };

        this.socket.onerror = (error) => {

            console.error(
                "WebSocket error:",
                error
            );
        };

        this.socket.onclose = () => {

            console.log(
                "Disconnected from ByteSwarm backend"
            );
        };
    }

    disconnect() {

        if (this.socket) {

            this.socket.close();

            console.log(
                "Worker disconnected"
            );
        }
    }
}

export default new WebSocketService();