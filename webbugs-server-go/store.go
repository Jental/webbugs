package main

import (
	"sync"
	"webbugs-server/models"
)

// Store - stores all app data
type Store struct {
	field         *models.Field
	components    map[uint]*models.Component
	players       []models.PlayerInfo
	subscribtions []func()
	eventQueue    chan *models.Event
	updateMutex   sync.Mutex
}

// NewStore - creates a new store
func NewStore(pageRadius uint) Store {
	field := models.NewField(pageRadius)
	return Store{
		field:         &field,
		components:    make(map[uint]*models.Component),
		players:       make([]models.PlayerInfo, 0),
		subscribtions: make([]func(), 0),
		eventQueue:    make(chan *models.Event),
	}
}
