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
https://i.imgur.com/rdE6gZ1.png

The messages supported by the websocket are as follows:
- C -> S:
    - "Join":
            This message is used to connect a player in a game.
            It's expected to have a name attached.
            The first person who joins a "non-computer generated game" will be
            automatically put as the Word Maker.
            If it's a computer generated game then the player will be a guesser.
```json
                {
                    "message": "Join",
                    "payload": {
                        "name": "{{NAME_HERE}}",
                        "playerName": "{{PLAYER_NAME_HERE}}",
                    }
                }
```
    
- S -> C:
    - "Accepted":
        This message is expected after the player has been successfully loaded into the game.
```json
                {
                    "message": "Accepted",
                    "payload": {}
                }
```
- S -> C:
    - "Kick":
        This message is ran if a player has been removed from a game.
        The reason of the kick should follow a language string from the lang.toml file.
        And should also follow i18n.
```json
                {
                    "message": "Kick",
                    "payload": {
                        "reason": "{{REASON_LANG_STRING}}"
                    }
                }
``` 

- S -> C:
    - "RoleUpdate":
        This message is sent from the server to set a player's role.
        There will be a role attached, and the players name/id number.
```json
            {
                "message": "RoleUpdate",
                "payload": {
                    "playerName": "{{PLAYER_NAME_HERE}}",
                    "newRole": {{PLAYER_ROLE}}
                }
            }
```
- S -> C:
    - "PlayerData":
        This message is used to bring a client up to date with information
        about the game.
        
        It will send a message with all of the players, their associated data.
            
```json
            {
                "message": "PlayerData",
                "payload": {
                    "players": [
                        {
                            "name": "{{PLAYER_NAME}}",
                            "role": {{PLAYER_ROLE}}
                        }
                    ]
                }
            }
```
- S -> C:
    - "GameData":
        This message is used to bring thge client up to date about the game.
        This has guessed letters, current word mask, and hangman state.

        All guessed letters are concatenated into one string to save space when
        transmitting.

        The current word mask (e.g "CA_T" or "DOGG_Y").

        The currentGuesser is the name of the player currently guessing (duh.)
```json

            {
                "message": "GameData",
                "payload": {
                    "gameData": {
                        "name": "{{GAME_NAME}}",
                        "guessedLetters": "{{Concatenated_Game_Letters}}",
                        "currentWordMask": "{{Current_word_mask}}",
                        "currentGuesser": "{{Current_guesser}}"
                    }
                }
            }
```
- C -> S:
    - "MakeGuess":
        This message makes the actual guess.

        And is tied to the "GuessWrong" message and "GuessCorrect" message.

        It is expected for the client to check if the letter has been guessed already.
        If it is already guessed, it'll receive a GuessWrong message after.
        If the guess is correct then it'll send the GuessCorrect message.
```json

    {
        "message": "MakeGuess",
        "payload": {
            "guess": "{{GUESSED_LETTER}}"
        }
    }

```
- S -> C:
    - "GuessStatus":
        Broadcast to everyone stating whether or not the guess was correct.
```json
    {
        "message": "GuessStatus",
        "payload": {
            "correct": true | false
        }
    }

```


- S -> C:
    - "HangManState":
        This message sends the current state of the hangman.
        
        This is the current stage of hangman.
        1 <= n <= 7
        if the state is at 7 then the game will be lost.
```json
    {
        "message": "HangManState",
        "payload": {
            "hangmanState": 7
        }
    } 
```

- S -> C:
    - "GameComplete":
        this message sends whether or not if the game was won or lost.

```json
    {
        "message": "GameComplete",
        "payload":{
            "winningTeam": RoleHere
        }
    }

```

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