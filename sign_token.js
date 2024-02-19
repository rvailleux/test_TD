
const { randomUUID } = require('crypto');
var jwt = require('jsonwebtoken');

//Params to modify
var private_key = 'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgDqAnXVs0u9x1L3q7gwCS9f757Ip5UUejNQxaa6wsrhWhRANCAARWvGocvvc/on9YdOeG8vtMBGGUW/PVRmaWrJHvWPjZJs3BKOhiqIf0DZg1zA7RvEobshoCiAODOhj3Uy1c2T9s'
var client_id = 'ed2e14f31ca343cd9e436db5c855f49b'
var client_key_id = '9f8ab87cebcb4de29143549c71eed4b6'
var account_name = 'apizee-dev'
var client_key_algorithm = 'ES256'
var app_id = '77b1a16db7094531817378fa11fb17f5'
var installation_id = '980c38e09c3845acbf5f7b8006c1db7c'



private_key = "-----BEGIN PRIVATE KEY-----\n" + private_key + "\n-----END PRIVATE KEY-----"

var header = {
    kid: client_key_id
}

var payload = {
    iss: client_id,
    sub: client_id,
    aud: 'https://' + account_name + '.talkdeskid.com/oauth/token',
    jti: randomUUID(),
    exp: Math.floor((Date.now() + 30000) / 1000),
    iat: Math.floor(Date.now() / 1000)
}

token = jwt.sign(payload, private_key, { header: header, algorithm: client_key_algorithm })

console.log("##### \n Forged JWT:")
console.log(token)

// Request credentials
const options = {
    method: 'POST',
    headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: token
    })
};

console.log("##### \n Options to retrieve credentials:")
console.log(options)

fetch('https://apizee-dev.talkdeskid.com/oauth/token', options)
    .then(response => response.json())
    .then(response => {
        console.log("##### \n Credential retrieved from Talkdesk:")
        console.log(response)

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + response.access_token);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "state": "approve",
            "reason": "All right"
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("https://api.talkdeskapp.com/apps/" + app_id + "/installations/" + installation_id + "/state", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));

    })
    .catch(err => console.error(err));