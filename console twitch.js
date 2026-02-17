function getChildById(elem, id) {
    for (const i in elem.children) {
        if (elem.children[i].id === id) {
            return elem.children[i];
        }
    }
    return null;
}

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
    const messageElement = mess.children[0].children[0].children[0].children[0].children[1].children[0].children[0];
    return "@" + messageElement.children[(messageElement.children[0].className === "chat-line__timestamp") ? 1 : 0].children[1].children[0].children[0].innerText;
}

function getContent(mess) {
    try {
        const messageElement = mess.children[0].children[0].children[0].children[0].children[1].children[0].children[0];
        const messageContentElement = messageElement.children[(messageElement.children[0].className === "chat-line__timestamp") ? 3 : 2];
        let temp = "";
        const childNodes = messageContentElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            switch (childNodes[i].className) {
                case ("chat-line__message--emote-button"): {
                    temp += childNodes[i].children[0].children[0].children[0].children[0].alt;
                    break;
                }
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

        if (Date.now() - connectTime < 1000) {
            return;
        }

        newMessages.forEach(message => {
            const content = getContent(message);
            console.log(content);
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