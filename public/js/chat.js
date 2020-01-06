const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#sendLocation')

const $messages = document.querySelector('#messages')
//HTML Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search,{ignoreQueryPrefic : true})
console.log(Qs.parse(location.search,{ignoreQueryPrefic : true}))

socket.on('countUpdated',(count) => {
    console.log('Count has been updated count = ',count)
})

socket.on('message',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm A') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage',(url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        url : url.url,
        createdAt : moment(url.createdAt).format('h:mm A') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log("+1 clicked")
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geo location id not supported by the browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((postion) => {
        const location = {
            latitude : postion.coords.latitude,
            longitude : postion.coords.longitude
        }
        socket.emit('shareLocation',location ,() => {
            $sendLocationButton.removeAttribute('disabled','disabled')
            console.log("Location Shared ")
        })
        console.log(location)
    })
})

socket.emit('join' , { username, room })