package main

import (
	"webbugs-server/models"

	"github.com/google/uuid"
)

// Store - stores all app data
type Store struct {
	field         *models.Field
	components    map[uint]*models.Component
	players       map[uuid.UUID]*models.PlayerInfo
	subscribtions []func()
	eventQueue    chan *models.Event
	isLocked      bool
}

// NewStore - creates a new store
func NewStore(pageRadius uint) Store {
	field := models.NewField(pageRadius)
	return Store{
		field:         &field,
		components:    make(map[uint]*models.Component),
		players:       make(map[uuid.UUID]*models.PlayerInfo, 0),
		subscribtions: make([]func(), 0),
		eventQueue:    make(chan *models.Event),
		isLocked:      false,
	}
}
