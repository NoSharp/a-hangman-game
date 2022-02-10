export const Role = {
    /**
     * The person currently guessing a letter.
     */
    GUESSING: 0,
    /**
     * The person not currently guessing.
     */
    IDLE: 1,
    /**
     * Whoever created the word for that round,
     * depends on game mode.
     */
    WORD_MAKER: 2
}