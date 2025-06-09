// params socket sẽ được lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (socket) => { 

  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // emit ngược lại một sự kiện về cho mọi client khác ngoại trừ người đang gửi request
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}