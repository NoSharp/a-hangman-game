# Hangman.

# Word List
Gotten from http://www.mieliestronk.com/corncob_lowercase.txt

## How the game works:

## Libraries (✅ approved, ❌ denied, 🔃 TBC ):
- Baretest ✅
- Ws ✅
- Express ✅
- JWT ✅
- pg (postgres lib) ✅ probably the right one.
- AJV ✅
- ws ✅

## Structure:
- **hangman/server** Handles the "web server" aspect of this:
    - **hangman/server/routes** Used to handle the actual endpoints that the client can request:
    - **hangman/server/game_logic** used for handling, turns win-states, character guessing etc.
    - **hangman/server/utils** used for miscelaneous utilities.
    - **hangman/server/words** used for ingesting and handling the words list.
    - **hangman/server/websocket** used for handling the websocket:
        - **hangman/server/websocket/messagetypes** a file is used for each message the client sends to the server, they follow a generic structure


## Websocket Structure:
Terms:
- S2C - Sent from the server to the client
- C2S - Sent from the client to the server
- A2A - Sent from either the client to the server or server to the client.

### Byte Buffer
The byte buffer is a non-standard method of serializing messages across
the websocket. 

The goal of this approach is to reduce wasted data being networked (like key name etc.),
and improve speed of data serialization, as there is a standard packet structure and layout as defined below. 

The library (as found in `shared/buffer.js`) doesn't need to have handling for a lot of data types
so they're not implemented.

Each integer has a given maximum length (in bytes) and is encoded in little-endian(least significant number first). 


S2C - Kick

Description: Used to display a message to the user once they've been kicked.

```json
{
    message: "I18N_MESSAGE"
}
```

C2S - Join

Description: Used to connect to a game.
```json
{
    roomCode: "ROOM_CODE"
}
```

S2C - Accepted

Description: Used to tell a client they've been accepted.
```json
{
    name: "Randomly Generated Name"
}
```

S2C - Word Status

Description: Used to tell the clients what to display. Each missing character is replaced with a space.

```json
{
    wordState: "FL  D"
}
```

S2C - Guess

Description: Used to network the status of a guess, to reduce data duplication, only a character will be networked and a true/false value for if it exists.

```json
{
    guessedCharacter: "c",
    correct: false
}
```

S2C - Game Complete

Description: Used to tell clients who won the game, winnerTeam is one of team enums.

```json
{
    winnerTeam: "GUESSERS"
}
```

S2C - Hangman State

Description: Used to update the hangman, and tell clients, (1-7).

```json
{
    hangmanState: 7
}
```

S2C - Player Join Game
Description: Used to tell the clients when a player connects.

```json
{
    id: playerId,
    name: Name
}
```

S2C - Player Guessing

Description: tells the client who's currently guessing.

```json
{
    id: playerId
}
```

S2C - Synchronise

Description: Used to fully scynhronise the client with the current game state, this will contain:
- previously guessed characters
- the current word state 
- all of the players in the game.
- hangman state
- who's currently guessing (Player Id)
```json
{
    guessedCharacters: [],
    currentWordState: "FL OD",
    players: [],
    hangmanState: 7,
    currentGuesser: playerId
}
```

## Data transfer objects (DTO's)

### Player
- `id` 
    - The id of the player in the game.
    - It's a little endian encoded unsigned 16 bit integer (when networked)

- `name`
    - The name of the player.
    - It's a 32 character long string.


## API Endpoints
- GET /
    - Returns the index page/SPA.

- GET /game/{room_name}
    - Returns a game from a room ID.
    - Status Codes:
        - 404, Room not found
        - 400, Missing room_name
        - 200, Game found, request successful. The client is then expected to proceed and establish a connection with the websocket.

- POST /game/
    - Used to create a game.
    - Request:
```json

    {
        "name": "{{GAME_NAME}}",
        "playerCount": 10
    }

```
- Status Codes:
    - 200, Success full request

    - 400, Invalid body:
```json
    {
        "invalidFields": [
            {
                "fieldName": "{{FieldName}}",
                "reason": "{{Reason}}"
            }
        ]
    }
```