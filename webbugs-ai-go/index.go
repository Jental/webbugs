package main

import (
	"log"
	"time"
	"webbugs-ai/contract"

	gosocketio "github.com/ambelovsky/gosf-socketio"
	transport "github.com/ambelovsky/gosf-socketio/transport"
	"github.com/google/uuid"
)

var playerIDs []uuid.UUID = make([]uuid.UUID, 0)

func onMetadata(metadata contract.MetadataContract) {
	found := false
	for _, playerID := range playerIDs {
		if playerID == metadata.PlayerID {
			found = true
			break
		}
	}
	if !found {
		log.Println("Player registered", metadata.PlayerID)
		playerIDs = append(playerIDs, metadata.PlayerID)
	}
}

func onData(data contract.DataContract) {
}

func initSocketConnection(onSuccess func(c *gosocketio.Client)) {
	c, err := gosocketio.Dial(
		gosocketio.GetUrl("localhost", 5000, false),
		transport.GetDefaultWebsocketTransport(),
	)
	if err != nil {
		log.Fatal(err)
	}

	// defer c.Close()

	err = c.On(gosocketio.OnDisconnection, func(h *gosocketio.Channel) {
		log.Fatal("Disconnected")
	})
	if err != nil {
		log.Fatal(err)
	}

	err = c.On(gosocketio.OnConnection, func(h *gosocketio.Channel) {
		log.Println("Connected")

		onSuccess(c)
	})
	if err != nil {
		log.Fatal(err)
	}

	err = c.On("metadata", func(h *gosocketio.Channel, data contract.MetadataContract) {
		log.Println("Received metadata")
		onMetadata(data)
	})
	if err != nil {
		log.Fatal(err)
	}

	err = c.On("data", func(h *gosocketio.Channel) {
		log.Println("Received data")
	})
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	initSocketConnection(func(c *gosocketio.Client) {
		err := c.Emit("register", new(interface{}))
		if err != nil {
			log.Fatal(err)
		}
	})

	time.Sleep(5 * time.Minute)
	log.Println("Complete")
}
