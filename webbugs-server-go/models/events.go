package models

import "github.com/google/uuid"

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
	GetType() EventType
}

// ClickEvent - click event
type ClickEvent struct {
	eventType EventType
	crd       FullCoordinates
	playerID  uuid.UUID
}

// NewClickEvent - creates new click event
func NewClickEvent(crd FullCoordinates, playerID uuid.UUID) ClickEvent {
	return ClickEvent{
		eventType: EventTypeClick,
		crd:       crd,
		playerID:  playerID,
	}
}

// GetType - returns event type
func (event *ClickEvent) GetType() EventType {
	return event.eventType
}

// SetBugEvent - set bug event
type SetBugEvent struct {
	eventType EventType
	crd       FullCoordinates
	playerID  uuid.UUID
	isBase    bool
}

// NewSetBugEvent - creates new set bug event
func NewSetBugEvent(crd FullCoordinates, playerID uuid.UUID, isBase bool) SetBugEvent {
	return SetBugEvent{
		eventType: EventTypeSetBug,
		crd:       crd,
		playerID:  playerID,
		isBase:    isBase,
	}
}

// GetType - returns event type
func (event *SetBugEvent) GetType() EventType {
	return event.eventType
}

// SetWallEvent - set wall event
type SetWallEvent struct {
	eventType EventType
	crd       FullCoordinates
	playerID  uuid.UUID
}

// NewSetWallEvent - creates new set wall event
func NewSetWallEvent(crd FullCoordinates, playerID uuid.UUID) SetWallEvent {
	return SetWallEvent{
		eventType: EventTypeSetWall,
		crd:       crd,
		playerID:  playerID,
	}
}

// GetType - returns event type
func (event *SetWallEvent) GetType() EventType {
	return event.eventType
}

// UpdateComponentActivityEvent - update component activity event. component activity should be updated based on current field state
type UpdateComponentActivityEvent struct {
	eventType EventType
	component *Component
}

// NewUpdateComponentActivityEvent - creates new click event
func NewUpdateComponentActivityEvent(component *Component) UpdateComponentActivityEvent {
	return UpdateComponentActivityEvent{
		eventType: EventTypeUpdateComponentActivity,
		component: component,
	}
}

// GetType - returns event type
func (event *UpdateComponentActivityEvent) GetType() EventType {
	return event.eventType
}
