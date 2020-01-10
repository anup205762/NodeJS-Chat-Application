const users = []

// add user

const addUser = ({id, username, room}) => {
    //Clean the data
    username = username.trim().toUpperCase()
    room = room.trim().toUpperCase()

    if(!username || !room){
        return{
            error : 'Username and room are required'
        }
    }
    //Validate username
    const existingUser = users.find((user) => (user.room === room && user.username === username))
    if(existingUser){
        return{
            error: 'Username is in use'
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toUpperCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id :122,
//     username : 'Anup',
//     room : 'ABC'
// })
// addUser({
//     id :22,
//     username : 'Ansup',
//     room : 'ABC'
// })
// addUser({
//     id :1222,
//     username : 'Anup1',
//     room : 'ABC1'
// })

// const user = getUser(1222)
// console.log(user)

// const room_a = getUsersInRoom('ABC')
// console.log('========ROOM A=========')
// console.log(room_a)

// const room_b = getUsersInRoom('ABC1')
// console.log('========ROOM A=========')
// console.log(room_b)
 