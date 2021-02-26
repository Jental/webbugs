package models

import (
	"fmt"

	"github.com/google/uuid"
)

// EventType - type of an event
type EventType uint

// Available event types
const (
	EventTypeClick                   EventType = 1
	EventTypeSetBug                  EventType = 2
	EventTypeSetWall                 EventType = 3
	EventTypeUpdateComponentActivity EventType = 4
)

// Event - interface for events
type Event interface {
	String() string
}

// ClickEvent - click event
type ClickEvent struct {
	EventType EventType
	Crd       FullCoordinates
	PlayerID  uuid.UUID
}

// NewClickEvent - creates new click event
func NewClickEvent(crd FullCoordinates, playerID uuid.UUID) ClickEvent {
	return ClickEvent{
		EventType: EventTypeClick,
		Crd:       crd,
		PlayerID:  playerID,
	}
}

func (event ClickEvent) String() string {
	return fmt.Sprintf("ClickEvent:{ %v %v %v }", event.Crd.Page, event.Crd.Cell, event.PlayerID)
}

// SetBugEvent - set bug event
type SetBugEvent struct {
	EventType EventType
	Crd       FullCoordinates
	PlayerID  uuid.UUID
	IsBase    bool
}

// NewSetBugEvent - creates new set bug event
func NewSetBugEvent(crd FullCoordinates, playerID uuid.UUID, isBase bool) SetBugEvent {
	return SetBugEvent{
		EventType: EventTypeSetBug,
		Crd:       crd,
		PlayerID:  playerID,
		IsBase:    isBase,
	}
}

func (event SetBugEvent) String() string {
	return fmt.Sprintf("SetBugEvent:{ %v %v %v %v }", event.Crd.Page, event.Crd.Cell, event.PlayerID, event.IsBase)
}

// SetWallEvent - set wall event
type SetWallEvent struct {
	EventType EventType
	Crd       FullCoordinates
	PlayerID  uuid.UUID
}

// NewSetWallEvent - creates new set wall event
func NewSetWallEvent(crd FullCoordinates, playerID uuid.UUID) SetWallEvent {
	return SetWallEvent{
		EventType: EventTypeSetWall,
		Crd:       crd,
		PlayerID:  playerID,
	}
}

func (event SetWallEvent) String() string {
	return fmt.Sprintf("SetWallEvent:{ %v %v %v }", event.Crd.Page, event.Crd.Cell, event.PlayerID)
}

// UpdateComponentActivityEvent - update component activity event. component activity should be updated based on current field state
type UpdateComponentActivityEvent struct {
	EventType EventType
	Component *Component
}

// NewUpdateComponentActivityEvent - creates new click event
func NewUpdateComponentActivityEvent(component *Component) UpdateComponentActivityEvent {
	return UpdateComponentActivityEvent{
		EventType: EventTypeUpdateComponentActivity,
		Component: component,
	}
}

func (event UpdateComponentActivityEvent) String() string {
	return fmt.Sprintf("UpdateComponentActivityEvent:{ %v }", event.Component.ID)
}
