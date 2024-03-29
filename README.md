# Hangman.

## Citations

`Julieta Ulanovsky, S. Matas, JP. del Peral, JL. Bailly. Montserrat Font https://fonts.google.com/specimen/Montserrat`

## How the game works:
A user will either click create or join game.
If they clicked create:
    They will specify the game name, this is used to identify the game.
    They will also enter a player count.
The game will then be created
If they clicked join:
    They will then be prompted to enter a game code, if it's valid they'll be loaded into a game.

Once the game has the specified amount of players to start, the game will then go-ahead.
To guess a character a player can press one of the light purple buttons, if a button is gray'd out then the player
cannot use it and must chose another character as that one has already been guessed.

If the guess was correct a previously blank character will appear
If the guess wasn't correct then a part of the gallows will be drawn

This continues until every character in the word has been guessed or until all of the gallows are drawn.

If the players have successfully revealed the word then the game is won by the players, otherwise it's won by the computer.

Once a game is complete the game name becomes available again for someone to re-use.

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
    - **/routes** Used to handle the actual endpoints that the client can request.
    - **/game_logic** used for handling, turns win-states, character guessing etc.
    - **/utils** used for miscelaneous utilities.
    - **/websocket** used for handling the websocket:
        - **/websocket/messagetypes** a file is used for each message the client sends to the server, they follow a generic structure

            Every file in the messagetypes folder is loaded at runtime, and handled correctly.
            This is to improve modularity, and decrese code replication.

            Each file **__MUST__** export:
            - onMessage: (ws: WebSocket, buffer: Buffer) -> void
            - messageName: string


- **hangman/public/spa** The front-end or "client" aspect:
    - **/api** Handles the interaction with the server on both the REST-API and Websocket.
    - **/dom** Utilities to handle the Document Object Model.
    - **/game_logic** Small utilities to decode information from a buffer.
    - **/styles** Various CSS style sheets for presentation of the game
    - **index.html** The Single page application which calls upon the other files.
    - **index.css** The style sheet to handle the presentation of the website.


## Websocket Structure:
Terms:
- S2C - Sent from the server to the client
- C2S - Sent from the client to the server
- A2A - Sent from either the client to the server or server to the client.
- b (when in context of a unit) - one 8 bit byte.

### Buffer
The buffer library is a method of serializing messages across
the websocket.

The goal of this approach is to reduce wasted data being networked (like key name etc.),
and improve speed of data serialization, as there is a standard packet structure and layout as defined below. 

The library (as found in `shared/buffer.js`) 
doesn't need to have handling for a lot of data types so they're not implemented.

Each integer has a given maximum length (in bytes) and is encoded in little-endian(least significant bit first).

**Bit Packing** 
For lack of a better term, when two numbers get combined
into one number, with a given bit-width, we can take advantage
of this with our predefined layout.

example:

a = 7 or 111

b = 16 or 10000

output:
```
|11110000|
 +++-----
  A   B
```
The alternative to this is to write two bytes which is far less efficient. 

**Size When Networked**

A comparison of the size of the payload of the previous JSON based approach and the new buffer approach. 
There will be (where applicable) a note about how those results were computed.

S2C - Kick

Description: Used to display a message to the user once they've been kicked.

```json
{
    "message": "I18N_MESSAGE"
}
```
buffer library
```
    String -- the message
```
Size When Networked(where message is empty): 
- buffer 1b 
- JSON 14b

C2S - Join

Description: Used to connect to a game.
```json
{
    "roomCode": "ROOM_CODE"
}
```
buffer library
```
    String -- the room code
```
Size When Networked(where roomCode is empty): 
- buffer 1b
- JSON 15b

S2C - Accepted

Description: Used to tell a client they've been accepted.
```json
{
    "name": "Randomly Generated Name",
    "id": 1
}
```
buffer library
```
    String -- the name of the client
    int (1b) -- the id of the client
```

Size When Networked(where name is empty and id is 1): 
- buffer 2b
- JSON 18b

S2C - Word Status

Description: Used to tell the clients what to display. Each missing character is replaced with a space.

```json
{
    "wordState": "FL  D"
}
```
buffer library
```
    String -- thats been guessed
```

Size When Networked(where wordstate is empty): 
- buffer 1b
- JSON 17b

S2C - Guess

Description: Used to network the status of a guess, to reduce data duplication, only a character will be networked and a true/false value for if it exists.

```json
{
    "guessedCharacter": "c",
    "correct": false
}
```

buffer library
```
    Char -- thats been guessed
    Boolean -- was it correct?
```
Size When Networked: 
- buffer 2b
- JSON 38b

S2C - Game Complete

Description: Used to tell clients who won the game, winnerTeam is one of team enums.

```json
{
    "winnerTeam": "GUESSERS"
}
```

Size When Networked:
- buffer 2b 
- JSON 38b

S2C - Hangman State

Description: Used to update the hangman, and tell clients, (1-7).

```json
{
    "hangmanState": 7
}
```
buffer library
```
    int (1b) -- the current state of the hangman
```
Size When Networked(where hangmanState is 0): 
- buffer 1b 
- JSON 18b

S2C - Player Join Game

Description: Used to tell the clients when a player connects.

```json
{
    "id": playerId,
    "name": "Name"
}
```
buffer library
```
    int (1b) -- the id of the player
    string -- the name of the player
```
Size When Networked(where name is empty and id is 0):
- buffer 2b 
- JSON 18b

S2C - Player Guessing

Description: tells the client who's currently guessing.

```json
{
    "id": playerId
}
```
buffer library
```
    int (1b) -- the id of the player
```
Size When Networked(where id is 0):

buffer 1b 

JSON 8b

S2C - Synchronise

Description: Used to fully scynhronise the client with the current game state, this will contain:
- previously guessed characters
- the current word state 
- all of the players in the game.
- hangman state
- the size of the room
- who's currently guessing (Player Id)
```json
{
    "hangmanState": 7,
    "guessedCharacters": [],
    "currentWordState": "FL OD",
    "players": [],
    "currentGuesser": playerId
}
```
buffer library
```
    int (1b) -- a bit-packed form of the hangmanState(3bit) and playerCount(5bit)
    string -- a null-terminated character array of the guessedCharacters
    string -- the current wordstate
    for 0 < n <= playerCount
        int (1b) -- the id of the player
        string -- the name of the player
    int (1b) -- the current guesser
```
Size When Networked(where all values are either empty or as small as possible):
- buffer 4b
- JSON 95b

S2C - Game Started

Description: Used to signify to the client that the game has begun.

## Data transfer objects (DTO's)

### Player
- `id` 
    - The id of the player in the game.
    - It's a little endian encoded unsigned 16 bit integer (when networked)

- `name`
    - The name of the player.


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
    - Player count must be less than 24 players.
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