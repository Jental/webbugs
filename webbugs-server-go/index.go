package main

import (
	"log"
	"net/http"
	"webbugs-server/contract"
	"webbugs-server/models"

	gosocketio "github.com/ambelovsky/gosf-socketio"
	transport "github.com/ambelovsky/gosf-socketio/transport"
	"github.com/google/uuid"
)

const port = ":5000"

var connectedClientCount uint = 0
var players []models.PlayerInfo = make([]models.PlayerInfo, 0)
var field models.Field
var components = make(map[uint]*models.Component)

func reCreateField() {
	var pageRadius uint = 10
	field = models.NewField(pageRadius)
	components = make(map[uint]*models.Component)

	pageCrd := models.NewCoordinates(0, 0, 0)

	for _, player := range players {
		c := make(chan models.Coordinates)
		go field.Get(pageCrd).GetRandomEmptyCellCoordinates(c)
		crd := <-c
		// event := models.NewSetBugEvent(
		// 	models.FullCoordinates{
		// 		page: pageCrd,
		// 		cell: crd,
		// 	},
		// 	playerID,
		// 	true)
		// TODO: apply event instead of set
		cellType := models.CellTypeBug
		isBase := true
		field.Get(pageCrd).Set(
			models.FullCoordinates{
				Page: pageCrd,
				Cell: crd,
			},
			&models.CellSetRequest{
				CellType:  &cellType,
				PlayerID:  player.ID,
				Component: nil,
				IsBase:    &isBase,
			})
	}
}

func onRegister(c *gosocketio.Channel) {
	newPlayerID := uuid.New()
	log.Printf("new player id: %v", newPlayerID)
	players = append(players, models.PlayerInfo{
		ID:     newPlayerID,
		Name:   newPlayerID.String(),
		Client: c,
	})

	allPlayerIDs := make([]uuid.UUID, len(players))
	for i, player := range players {
		allPlayerIDs[i] = player.ID
	}

	c.Emit(string(contract.MetadataMessageType), contract.MetadataContract{
		PlayerID:  newPlayerID,
		PlayerIDs: allPlayerIDs,
	})

	pageCrd := models.NewCoordinates(0, 0, 0)
	cc := make(chan models.Coordinates)
	go field.Get(pageCrd).GetRandomEmptyCellCoordinates(cc)
	crd := <-cc
	log.Printf("Setting a base at cell %v", crd)
	// event := models.NewSetBugEvent(
	// 	models.FullCoordinates{
	// 		page: pageCrd,
	// 		cell: crd,
	// 	},
	// 	playerID,
	// 	true)
	// TODO: apply event instead of set
	cellType := models.CellTypeBug
	isBase := true
	err := field.Get(pageCrd).Set(
		models.FullCoordinates{
			Page: pageCrd,
			Cell: crd,
		},
		&models.CellSetRequest{
			CellType:  &cellType,
			PlayerID:  newPlayerID,
			Component: nil,
			IsBase:    &isBase,
		})
	if err != nil {
		log.Printf("Error. Failed to set a cell: %v", err)
	}

	log.Printf("field len: %d", len(field.Grid))

	c.Emit(string(contract.DataMessageType), contract.DataContract{
		Field:      contract.ConvertField(&field),
		Components: make(map[uint]contract.ComponentContract, 0),
	})
}

func main() {
	reCreateField()

	server := gosocketio.NewServer(transport.GetDefaultWebsocketTransport())

	server.On(gosocketio.OnConnection, func(c *gosocketio.Channel) {
		log.Printf("socket client connected: %v", c.Ip())
		connectedClientCount++
	})

	server.On(gosocketio.OnError, func(c *gosocketio.Channel) {
		log.Printf("socket error: %v", c.Ip())
	})

	server.On(gosocketio.OnDisconnection, func(c *gosocketio.Channel) {
		log.Printf("socket client closed: %v", c.Ip())
		connectedClientCount--
	})

	server.On(string(contract.RegisterMessageType), func(c *gosocketio.Channel) {
		log.Printf("registration: %v", c.Ip())
		onRegister(c)
	})

	server.On(string(contract.ClickMessageType), func(c *gosocketio.Channel) {
		log.Printf("click: %v", c.Ip())
	})

	server.On(string(contract.ResetMessageType), func(c *gosocketio.Channel) {
		log.Printf("field reset: %v", c.Ip())
	})

	serveMux := http.NewServeMux()
	serveMux.Handle("/", http.FileServer(http.Dir("../webbugs-client/dist/")))
	serveMux.Handle("/socket.io/", server)
	log.Printf("Serving at localhost%v...", port)
	log.Println(http.ListenAndServe(port, serveMux))
}
