import { Application } from "express";
import express = require("express");
import * as mongoose from "mongoose";
import morgan = require("morgan");
import http = require("http");
// import path from 'path';
//const cors = require('cors');
// import expressValidator from 'express-validator';
import expressSession = require("express-session");
import * as router from "./routes";
var socket = require("socket.io");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  updatePoints,
} = require("./users");

let newPrivateRoomDetails: any;
const app: Application = express();
app.use(express.json()); //middlewre
app.use(express.urlencoded({ extended: false })); //if you dont have nested

app.use(
  expressSession({
    secret: "rishabhsingh",
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false },
  })
); //secret is used to encrypt..

//connetciong mongo
mongoose.connect("mongodb://localhost/formSubmissions", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected..");
});

app.use(morgan("tiny"));
app.use("/", router as any);

const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socket(server);
server.listen(port, () => console.log("listenting to port 8080"));

interface props {
  userName: any;
  chatRoom: any;
}
io.on("connection", (socket: any) => {
  //console.log(socket);
  console.log("socket is connected");

  socket.on("getMyTurn", (userName: any, callback: any) => {
    const activePlayer = getUser(socket.id);
    io.to(activePlayer.chatRoom).emit("setMyTurn", { userName });
  });

  socket.on(
    "sendMessage",
    ({ message, correctAnswerByUser }: any, callback: any) => {
      console.log("gussed ny user", correctAnswerByUser);
      console.log("send message id", socket.id);
      const user = getUser(socket.id);
      if (correctAnswerByUser) {
        updatePoints(user);
      }

      io.to(user.chatRoom).emit("message", {
        user: user.userName,
        text: message,
      });
      io.to(user.chatRoom).emit("roomData", {
        chatRoom: user.chatRoom,
        _users: getUsersInRoom(user.chatRoom),
      });

      callback();
    }
  );
  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    const user = removeUser(socket.id);
    console.log("user had left!!!");

    if (user) {
      io.to(user.chatRoom).emit("message", {
        user: "admin",
        text: `${user.userName} has left`,
      });
      io.to(user.chatRoom).emit("roomData", {
        chatRoom: user.chatRoom,
        _users: getUsersInRoom(user.chatRoom),
      });
    }
  });

  socket.on("disconnected", () => {
    console.log("disconnect", socket.id);
    const user = removeUser(socket.id);
    console.log("user had left!!!");
    socket.leave(user.chatRoom);

    if (user) {
      io.to(user.chatRoom).emit("message", {
        user: "admin",
        text: `${user.userName} has left`,
      });
      io.to(user.chatRoom).emit("roomData", {
        chatRoom: user.chatRoom,
        _users: getUsersInRoom(user.chatRoom),
      });
    }
  });

  ///////////////////////////canvas/////////////////////
  socket.on("joinCanvas", ({ userName, chatRoom }: props, callback: any) => {
    console.log(userName, chatRoom);
    const { error, user } = addUser({ id: socket.id, userName, chatRoom });
    if (error) {
      return callback(error);
    }
    socket.join(user.chatRoom);

    socket.emit("message", {
      user: "admin",
      text: `${user.userName}, Welcome to chat room ${user.chatRoom}`,
    });
    socket.broadcast
      .to(user.chatRoom)
      .emit("message", { user: "admin", text: `${user.userName}, has joined` });
    if (newPrivateRoomDetails) {
      console.log(newPrivateRoomDetails, "these are saved privateRoomDetails");
      socket.emit("setPrivateRoomDetails", {
        privateRoomDetails: newPrivateRoomDetails,
      });
    }

    io.to(user.chatRoom).emit("roomData", {
      chatRoom: user.chatRoom,
      _users: getUsersInRoom(user.chatRoom),
    });
    callback();
  });

  socket.on(
    "setSelectedWord",
    (selectedWord: string, nextPlayer: number, callback: any) => {
      const user = getUser(socket.id);
      io.to(user.chatRoom).emit("setSelectedWord", {
        _selectedWord: selectedWord,
        nextPlayer,
      });
    }
  );
  socket.on("setPrivateRoomDetails", ({ privateRoomDetails }: any) => {
    newPrivateRoomDetails = privateRoomDetails;
    const user = getUser(socket.id);
    io.to(user.chatRoom).emit("setPrivateRoomDetails", { privateRoomDetails });
  });

  socket.on("sendCanvasData", (canvasData: any, callback: any) => {
    const user = getUser(socket.id);
    socket.broadcast
      .to(user.chatRoom)
      .emit("getCanvasData", { user: user.userName, canvasData: canvasData });

    //callback();
  });
  socket.on("setRoundChange", (currentRound: number) => {
    console.log("current round is", currentRound);
    const user = getUser(socket.id);
    io.to(user.chatRoom).emit("setRoundChange", {
      nextRound: currentRound + 1,
    });
  });
  socket.on("endGame", () => {
    const user = getUser(socket.id);
    io.to(user.chatRoom).emit("endGame");
  });
});
//  function newConnection(socket:any){

//  }

// //eq (equal)
// //ne(not Equal)
// //gt(greater than)
// //gte(greater than equal to)
// //lt(less then)
// //lte(less than)
// //in
// //nin(not in)
//
//app.use(cors());//connects 2 server to allowto pass the data
//
