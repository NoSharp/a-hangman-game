# Hangman.

## Strucutre:
- hangman/server Handles the "web server" aspect of this. :

- hangman/server/routes Used to handle the actual endpoints that the client can request:
- hangman/server/routes/api For the REST API aspect of this project, containing things like the GameState and other parts:
- hangman/server/routes/client For the part of the webserver that the client will directly query, typically just "/" or "/index.html"

- hangman/server/data For the data part of the project, stuff like Redis and PostgreSQL interaction.
- hangman/server/data/dto Used to construct/define Data Transport Objects which represent something in the database.


## How it works:
The website is a SPA (Single Page Application), where the content on the webpage updates when the user joins/creates a room.

A room is wrappper for the Game object which handles the current game state such as hangman status, guesses etc.
Each game can have 2 < n < 10 players, a Player is created when they initiate a connection with the websocket.

The current flow of the websocket:
https://i.imgur.com/rdE6gZ1.png

The messages supported by the websocket are as follows:
- C -> S:
    - "Join":
            This message is used to connect a player in a game.
            It's expected to have a name attached.
```json
                {
                    "message": "Join",
                    "payload": {
                        "name": "{{NAME_HERE}}"
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
        
        It will send a message with all of the players, their associated data
        and another things like current guessed letters and their associated data.
            
```json
            {
                "message": "GameInfo",
                "payload": {
                    "players": [
                        {
                            "name": "{{PLAYER_NAME}}",
                            "role": {{PLAYER_ROLE}},
                            "score": {{PLAYER_SCORE}}
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
                    "gameInfo": {
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
    - "GuessWrong":
        This message responds if the guess is incorrect.

        This should be used to increment the game round counter, and change guesser.
```json
    {
        "message": "GuessWrong",
        "payload": {
            "guessedLetters": "{{Concatenated_Guessed_Letters}}"
        }
    }

```

- S -> C:
    - "GuessCorrect":
        This message responds if the guess is correct.

        This should be used to increment the game round counter, and change guesser.
        
        It will send a new work mask. and the new concatenated string of guessed letters.
```json
    {
        "message": "GuessCorrect",
        "payload": {
            "wordMask": "{{NEW_WORD_MASK}}",
            "guessedLetters": "{{Concatenated_Guessed_Letters}}"
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