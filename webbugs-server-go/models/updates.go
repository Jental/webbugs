package models

import "fmt"

// UpdateType - update type
type UpdateType uint

// Available update types
const (
	UpdateTypeField           UpdateType = 1
	UpdateTypeComponents      UpdateType = 2
	UpdateTypeAddComponent    UpdateType = 3
	UpdateTypeRemoveComponent UpdateType = 4
)

// Update - common interface for updates
type Update interface {
	String() string
}

// FieldUpdate - field update
type FieldUpdate struct {
	UpdateType UpdateType
	Crd        FullCoordinates
	Request    CellSetRequest
}

// NewFieldUpdate - creates new field update
func NewFieldUpdate(crd FullCoordinates, request CellSetRequest) FieldUpdate {
	return FieldUpdate{
		UpdateType: UpdateTypeField,
		Crd:        crd,
		Request:    request,
	}
}

func (update FieldUpdate) String() string {
	return fmt.Sprintf("FieldUpdate:{ %v %v %v }", update.Crd.Page, update.Crd.Cell, update.Request)
}

// ComponentsUpdate - components update
type ComponentsUpdate struct {
	UpdateType UpdateType
	ID         uint
	Request    ComponentSetRequest
}

// NewComponentsUpdate - creates new component update
func NewComponentsUpdate(id uint, request ComponentSetRequest) ComponentsUpdate {
	return ComponentsUpdate{
		UpdateType: UpdateTypeComponents,
		ID:         id,
		Request:    request,
	}
}

func (update ComponentsUpdate) String() string {
	return fmt.Sprintf("ComponentsUpdate:{ %v %v }", update.ID, update.Request)
}

// AddComponentUpdate - add component update
type AddComponentUpdate struct {
	UpdateType UpdateType
	Component  *Component
}

// NewAddComponentUpdate - creates new add component update
func NewAddComponentUpdate(component *Component) AddComponentUpdate {
	return AddComponentUpdate{
		UpdateType: UpdateTypeAddComponent,
		Component:  component,
	}
}

func (update AddComponentUpdate) String() string {
	return fmt.Sprintf("AddComponentUpdate:{ %v }", update.Component)
}

// RemoveComponentUpdate - remove component update
type RemoveComponentUpdate struct {
	UpdateType UpdateType
	ID         uint
}

// NewRemoveComponentUpdate - creates new add component update
func NewRemoveComponentUpdate(id uint) RemoveComponentUpdate {
	return RemoveComponentUpdate{
		UpdateType: UpdateTypeRemoveComponent,
		ID:         id,
	}
}

func (update RemoveComponentUpdate) String() string {
	return fmt.Sprintf("RemoveComponentUpdate:{ %v }", update.ID)
}
