import { WebSocketServer ,WebSocket  } from "ws";
import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

const wss = new WebSocketServer({ port: 8080 });


interface User {
  userId: string;
  room : string[];
  ws : WebSocket;
}

const users: User[] = [];


function checkUser(token:string):string | null {
  const decoded = jwt.verify(token, JWT_SECRET);
 
  if(decoded && typeof decoded === 'object' && 'userId' in decoded){
    return decoded.userId ;
  }
  else{
    return null;
  }

  
}

wss.on("connection", function connection(ws, req) {
  const url = req.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || " ";
  const userId = checkUser(token);

  if(!userId){
   ws.close();
   return ;
  }

  users.push({
    userId,
    room: [],
    ws,
  })


 
  ws.on("message", function message(data) {
    const parsedData = JSON.parse(data as unknown as string);
    if (parsedData.type === "join_room") {
      const user = users.find( u => u.ws === ws);
      user?.room?.push(parsedData.room);
    }

    if( parsedData.type === "leave_room"){
      const user = users.find(u => u.ws === ws );
      if(!user) return ;
      user.room = user?.room.filter(r => r !== parsedData.room);
      

      if(parsedData.type === "chat"){
        const roomId = parsedData.room;
        const message = parsedData.message;
        user.ws.send(JSON.stringify({
          type: "chat",
          message: message,
          roomId,
        }))
      }
    
    
    }

    
  });
});
