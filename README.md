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
The website is a SPA (Single Page Application), where the content on the webpage updates when the user joins/creates a room.

A room is wrappper for the Game object which handles the current game state such as hangman status, guesses etc.
Each game can have n > 0 players, a Player is created when they initiate a connection with the websocket.

The current flow of the websocket:

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
    gameCode: "GAME_CODE"
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
    guessedCharacter: "char",
    found: false
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

S2C - Deep Synchronise

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
        - 200, Game found, request successful.
            This object will have information abuot the websocket, game name, player data etc.
```json
    {
        "game": {
            "name": "{{GAME_NAME}}",
            "code": "{{GAME_CODE}}",
            "maxPlayers": 10,
            "players": [
                {
                    "name": "{{PLAYER_NAME}}",
                    "role": "{{PLAYER_ROLE_ENUM}}"
                }
            ]
        },
        "websocketUrl": "http://localhost:8080/ws/game_code"
    }
```
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
        - 200, Success full request:
```json
    {
        "game": {
            "name": "{{GAME_NAME}}",
            "maxPlayers": 10,
            "code": "{{GAME_CODE}}",
            "players": [
                {
                    "name": "{{PLAYER_NAME}}",
                    "role": "{{PLAYER_ROLE_ENUM}}"
                }
            ]
        },
        "websocketUrl": "http://localhost:8080/ws/game_code"
    }
```
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