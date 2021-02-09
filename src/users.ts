const users: any[] = [];
interface props{
    id:string,
    userName:any
    chatRoom:any
}
const addUser = ({id,userName,chatRoom}:props)=>{

    userName = userName.trim().toLowerCase();
    chatRoom = chatRoom.trim().toLowerCase();
    let points=0;

    const existingUser = users.find((user)=>user.userName===userName && user.chatRoom===chatRoom);
    if(!userName || !chatRoom) return { error: 'hey Username and room are required.' };
    if(existingUser){
        return{error:'UserName is Taken'}
    }

    const user = {id,userName,chatRoom,points};
    users.push(user);
    return {user};
}

const removeUser = (id:string)=>{
    const index = users.findIndex((user)=>user.id===id);
    if(index!== -1){
        return users.splice(index,1)[0];
    }
}

const getUser=(id:any)=>users.find((user)=>user.id===id);

const getUsersInRoom = (chatRoom:any)=>users.filter((user)=>user.chatRoom==chatRoom);

const updatePoints = (user:any)=>{
    
    if(user){
       user.points=user.points+250;
    }
}

 module.exports={addUser,removeUser,getUser,getUsersInRoom,updatePoints};


