const { Server } = require("socket.io");
const MESSAGE = require("../models/messageModel");
const Channel = require("../models/channelModel");

function setUpSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log("user disconnected");
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const SendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const receiverSocketId = userSocketMap.get(message.receiver);

    const createdMessage = await MESSAGE.create(message);

    const messageData = await MESSAGE.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName Image color")
      .populate("receiver", "id email firstName lastName Image color");

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", messageData);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, fileUrl, content, sender, messageType } = message;
    const createMessage = await MESSAGE.create({
      sender,
      receiver: null,
      fileUrl,
      content,
      messageType,
      timestamp: new Date(),
    });

    const messageData = await MESSAGE.findById(createMessage._id)
      .populate("sender", "id email firstName lastNae Image color")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createMessage._id },
    });
    const channel = await Channel.findById(channelId).populate("members");
    console.log("this is channel",channel)
    const finalData = { ...messageData._doc, channelId: channel._id };

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("receive-channel-message", finalData);
          console.log("event sent")
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
      io.to(adminSocketId).emit("receive-channel-message", finalData);
      }
    }}





    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId;
      if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log("user connected");
      } else {
        console.log("user id not provided.");
      }

      socket.on("sendMessage", (message) => {
        console.log("sending message one to one")
        SendMessage(message);
      });


      socket.on("send-channel-message", (message) => {
        console.log("channel received on send channel mesage")
        sendChannelMessage(message);
      });


      socket.on("disconnect", () => {
        disconnect(socket);
      });
    });
}

module.exports = { setUpSocket };
