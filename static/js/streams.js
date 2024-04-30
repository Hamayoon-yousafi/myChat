const APP_ID = 'e58ba9c06aee42f8a4a595cca8389e80'
const CHANNEL = sessionStorage.getItem('room')
const Token = sessionStorage.getItem('token')
let UID = sessionStorage.getItem('UID');

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL
    
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)
    try {
        await client.join(APP_ID, CHANNEL, Token, UID)
    } catch(error){
        console.log(error)
        window.open('/', '_self')
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player = `
        <div class="video-container" id="user-container-${UID}">
            <div class="username-wrapper"><span class="user-name">My Name</span></div>
            <div class="video-player" id="user-${UID}"></div>
        </div>
    `
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)

        if(player != null){
            player.remove()
        }

        player = `
        <div class="video-container" id="user-container-${user.uid}">
            <div class="username-wrapper"><span class="user-name">My Name</span></div>
            <div class="video-player" id="user-${user.uid}"></div>
        </div>
        `
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }

}

let handleUserLeft = (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop();
        localTracks[i].close();
    }

    await client.leave();
    window.open('/', '_self');
};

let toggleMic = (e) => {
    toggleMicAndCamera(e, 0)
}

let toggleCamera = (e) => {
    toggleMicAndCamera(e, 1)
};

let toggleMicAndCamera = async (e, i) => {
    if(localTracks[i].muted){
        await localTracks[i].setMuted(false);
        e.target.style.backgroundColor = '#fff';        
    } else {
        await localTracks[i].setMuted(true);
        e.target.style.backgroundColor = 'rgb(255,80,80,1)';
    }
}

joinAndDisplayLocalStream()

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggleMic);