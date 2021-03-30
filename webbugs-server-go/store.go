package main

import (
	"webbugs-server/models"
	"webbugs-server/models/components"

	"github.com/google/uuid"
)

// Store - stores all app data
type Store struct {
	field         *models.Field
	components    *components.Components
	players       map[uuid.UUID]*models.PlayerInfo
	subscribtions []func()
	eventQueue    chan *models.Event
	isLocked      bool
}

// NewStore - creates a new store
func NewStore(pageRadius uint) Store {
	field := models.NewField(pageRadius)
	var components components.Components
	return Store{
		field:         &field,
		components:    &components,
		players:       make(map[uuid.UUID]*models.PlayerInfo, 0),
		subscribtions: make([]func(), 0),
		eventQueue:    make(chan *models.Event),
		isLocked:      false,
	}
}
