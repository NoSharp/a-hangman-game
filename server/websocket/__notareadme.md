Every file in the messagetypes folder is loaded at runtime, and handled correctly.
This is to improve modularity, and decrese code replication.

Each file **__MUST__** export:
    onMessage
    messageName