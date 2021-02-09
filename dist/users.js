const users = [];
const addUser = ({ id, userName, chatRoom }) => {
    userName = userName.trim().toLowerCase();
    chatRoom = chatRoom.trim().toLowerCase();
    let points = 0;
    const existingUser = users.find((user) => user.userName === userName && user.chatRoom === chatRoom);
    if (!userName || !chatRoom)
        return { error: 'hey Username and room are required.' };
    if (existingUser) {
        return { error: 'UserName is Taken' };
    }
    const user = { id, userName, chatRoom, points };
    users.push(user);
    return { user };
};
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};
const getUser = (id) => users.find((user) => user.id === id);
const getUsersInRoom = (chatRoom) => users.filter((user) => user.chatRoom == chatRoom);
const updatePoints = (user) => {
    if (user) {
        user.points = user.points + 250;
    }
};
module.exports = { addUser, removeUser, getUser, getUsersInRoom, updatePoints };
//# sourceMappingURL=users.js.map