// Here because youtube uses the same id multiple times (bad youtube bad)
function getChildById(elem, id) {
    for (const i in elem.children) {
        if (elem.children[i].id === id) {
            return elem.children[i];
        }
    }
    return null;
}

// Get chat container
const chat = document.getElementsByTagName("ytd-live-chat-frame")[0].children[0].contentDocument.getElementById("items");

function getMessages(requirement = (mess) => {
    return true;
}) {
    const temp = [];
    for (let i = 0; i < chat.children.length; i++) {
        // Only get user messages
        if (chat.children[i].tagName !== "YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER") {
            continue;
        }
        if (!requirement(chat.children[i])) {
            continue;
        }
        temp.push(chat.children[i]);
    }
    return temp;
}

function getSender(mess) {
    return getChildById(getChildById(mess, "content").getElementsByTagName("yt-live-chat-author-chip")[0], "author-name").firstChild.wholeText;
}

function getContent(mess) {
    let temp = "";
    const childNodes = getChildById(getChildById(mess, "content"), "message").childNodes;
    for (let i = 0; i < childNodes.length; i++) {
        switch (childNodes[i].tagName) {
            // Emoji case (alt because it needs to be a string, so it's usually the emoji unicode character itself)
            case ("IMG"): {
                temp += childNodes[i].alt;
                break;
            }
            // Text case
            default: {
                temp += childNodes[i].wholeText;
                break;
            }
        }
    }
    return temp;
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
            socket.send(JSON.stringify({
                sender: getSender(message),
                content: getContent(message),
                platform: "youtube"
            }));
        });
    }, 16);
};

socket.onclose = () => {
    console.error("lost connection to server :(");
};

socket.onerror = socket.onclose;