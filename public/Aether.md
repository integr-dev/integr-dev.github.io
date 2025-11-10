# Aether
Aether is a lightweight socket transport framework. It provides a basic abstraction layer for serialization of objects and transport over sockets.

## Eon
Eon is the serialization format used by Aether. It is a binary format designed for efficiency and ease of use.
### Utility Classes
The Eon Reader and Writer classes provide methods for reading and writing Eon-encoded data. They support various data types.
### Kotlinx Serialization
Aether integrates with Kotlinx Serialization to allow easy serialization and deserialization of Kotlin data classes to and from Eon format.
Therefore, classes intended for serialization must be annotated with `@Serializable`.

## Socket Transport
Aether provides a socket transport layer that allows for sending and receiving Eon-encoded data over TCP sockets.
### Bridge
Aether includes a bridge component that facilitates communication between different systems or components using the socket transport layer.
The bridge provides useful methods for interacting with the socket, such as sending and receiving packets, yet still allows low-level access to the underlying socket if needed.
### Timestamps
Aether automatically timestamps packets sent over the socket transport, allowing for tracking of message timing.
### ObjectIds
Sent packets can be tagged with objectIds to easily identify the source-type of the data being transmitted.
For example, a packet containing user data might be tagged with an objectId of 1. When a packet is received, the objectId can be used to determine that the data is of type user data.
This is of course fully optional.

## Hooks
Aether provides all its event logic in one place. When initializing either a server or a client, you can provide hooks for various events such as connection established, data received etc.

```kotlin
AetherServer.suspended.start(9999) {
    onClientConnected += { bridge ->
        println("Client connected: ${bridge.socket.inetAddress.hostAddress}")
    }
    
    onClose += {
        println("Server is closing.")
    }
}
```

## Async I/O
Aether leverages Kotlin Coroutines for asynchronous I/O operations, making it easy to work with non-blocking socket communication.
### Packet listeners
Both client and server have the capability to asynchronously listen for packets.

```kotlin
onPacketReceived += { bridge ->
    val (objectId, buffer) = bridge.readPacketBuffer()

    println("Packet received with object ID: $objectId")

    when (objectId) {
        1 -> {
            val packet = bridge.decodeWithPayloadType<MyObject>(buffer)
            val obj = packet.payload
            val timestamp = packet.timestamp
            println("Received message: ${obj.message} at $timestamp")

            this.broadcast(obj, 1)
        }
    }
}
```