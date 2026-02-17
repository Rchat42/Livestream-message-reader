# How to use

1) Run the main.js file using node (aka "node main.js" in the terminal), keep it running for however long you want
2) Go to the livestream web page you wanna record the messages in
3) Open up the console tab in the inspect menu
4) Copy paste the code from the corresponding console.js file and run it (enter)

You can now connect to ws://localhost:3001 and it will receive messages containing the sender, content and platform.
Messages are sent as a stringified JSON object (or struct / dictionary for you non-JSers) in the form:

    {
        "sender": "@username",
        "content": "message string",
        "platform": "youtube" or "twitch"
    }

It also has a web page built in at http://localhost:3000.

**No port forwarding is needed, all of it is run locally.**

# Other info

You can modify the files in the webpage folder (if you change their names or add new ones, make sure that the server in main.js knows about and responds to them).

*(You can also use this for any other program, just connect it to the websocket and it'll receive messages too!)*