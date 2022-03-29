export function inflate(proto, methodName, newMethod) {
  proto[methodName] = newMethod;
}
