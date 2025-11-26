import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    // Check if Socket.IO is already initialized
    if (!res.socket.server.io) {
        // Define the path for Socket.IO connections
        const path = "/api/socket/io";

        // Cast Next.js socket server to NetServer type
        const httpServer: NetServer = res.socket.server as any;

        console.log("Socket IO: initializing server...");

        // Initialize Socket.IO/WebSocket server on top of the existing HTTP server
        const io = new ServerIO(httpServer, {
            path,                  // Custom path for Socket.IO client connection
            addTrailingSlash: false // Disable automatic trailing slash in path
        });

        /**
         * Register event listeners
         */
        io.on("connection", (socket) => {
            // Triggered when a client connects
            console.log("Socket connected:", socket.id);

            // Triggered when a client disconnects
            socket.on("disconnect", () => {
                console.log("Socket disconnected:", socket.id);
            });
        });

        // Save the Socket.IO instance on the server object
        // This ensures only one instance exists and prevents re-initialization
        res.socket.server.io = io;
    } else {
        // Socket.IO server already exists; do not create a new instance
        console.log("Socket IO: server already running.");
    }

    // End the API request (required in Next.js API routes)
    res.end();
};

export default ioHandler;




// export const config = {
//     api: {
//         bodyParser: false
//     }
// }

// const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
//     if(!res.socket.server.io){
//         const path = '/api/socket/io'
//         const httpServer: NetServer = res.socket.server as any
//         const io = new ServerIO(httpServer, {
//             path: path,
//             addTrailingSlash: false
//         })
//         res.socket.server.io = io
//     }

//     res.end()
// }

// export default ioHandler;