import Ajv from "ajv";
const ajv = new Ajv();

const validateGeneralRequest = ajv.compile({
    type: "object",
    properties: {
        message: {
            type: "string"
        },
        payload: {
            type: "object"
        }
    },
    required: [
        "message",
        "payload",
    ]
});

/**
 * Used to validate the "general" request,
 * does not validate payload.
 * @param {any} req
 */
export function isValidRequest(req){
    return validateGeneralRequest(req);
}

const validateJoinRequest = ajv.compile({
    type: "object",
    properties: {
        name: {
            type: "string"
        }
    },
    required: [
        "name"
    ]
});

/**
 * Used to validate the join request.
 * @param {any} req
 */
export function isValidJoinRequest(req){
    return validateJoinRequest(req);
}

/**
 * Creates an invalid payload message to respond
 * to the client, when the message is invalid.
 * @param reason {String}
 * @returns {any}
 */
export function createInvalidPayloadMessage(reason){
    return {
        "message": "Error",
        "payload": {
            "reason": reason
        }
    }
}
