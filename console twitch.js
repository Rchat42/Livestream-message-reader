// Get chat container
// Why couldn't it just have an id :(
const chat = document.getElementById("root").children[0].children[0].children[1].children[2].children[0].children[1].children[0].children[0].children[0].children[1].children[0].children[1].children[1].children[0].children[3].children[1].children[1].children[0];

function getMessages(requirement = (mess) => {
    return true;
}) {
    const temp = [];
    for (let i = 0; i < chat.children.length; i++) {
        if (!requirement(chat.children[i])) {
            continue;
        }
        temp.push(chat.children[i]);
    }
    return temp;
}

function getSender(mess) {
    // Jesus christ why is there so much nesting
    const messageElement = mess.children[0].children[0].children[0].children[0].children[1].children[0].children[0];
    // Basically, if the timestamp is there, we need to check the next child element
    return "@" + messageElement.children[(messageElement.children[0].className === "chat-line__timestamp") ? 1 : 0].children[1].children[0].children[0].innerText;
}

function getContent(mess) {
    // If it errors, it's probably not a message
    try {
        const messageElement = mess.children[0].children[0].children[0].children[0].children[1].children[0].children[0];
        const messageContentElement = messageElement.children[(messageElement.children[0].className === "chat-line__timestamp") ? 3 : 2];
        let temp = "";
        const childNodes = messageContentElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            switch (childNodes[i].className) {
                // Emoji case (alt because it needs to be a string, so it's usually the emoji unicode character itself)
                case ("chat-line__message--emote-button"): {
                    temp += childNodes[i].children[0].children[0].children[0].children[0].alt;
                    break;
                }
                // Text case
                case ("text-fragment"): {
                    temp += childNodes[i].innerText;
                    break;
                }
            }
        }
        return temp;
    } catch (e) {
        return undefined;
    }
}

const socket = new WebSocket("ws://localhost:3001");

socket.onopen = () => {
    const connectTime = Date.now();
    setInterval(() => {
        const newMessages = getMessages((mess) => {
            if (mess.alreadyChecked) {
                return false;
            }
            mess.alreadyChecked = true;
            return true;
        });

        // Check if we connected less than a second ago (avoids counting messages already there)
        if (Date.now() - connectTime < 1000) {
            return;
        }

        newMessages.forEach(message => {
            const content = getContent(message);
            if (content === undefined) {
                return;
            }
            socket.send(JSON.stringify({
                sender: getSender(message),
                content: content,
                platform: "twitch"
            }));
        });
    }, 16);
};

socket.onclose = () => {
    console.error("lost connection to server :(");
};

socket.onerror = socket.onclose;