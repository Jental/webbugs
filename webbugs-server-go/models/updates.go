package models

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
	GetUpdateType() UpdateType
}

// FieldUpdate - field update
type FieldUpdate struct {
	updateType UpdateType
	crd        FullCoordinates
	request    CellSetRequest
}

// NewFieldUpdate - creates new field update
func NewFieldUpdate(crd FullCoordinates, request CellSetRequest) FieldUpdate {
	return FieldUpdate{
		updateType: UpdateTypeField,
		crd:        crd,
		request:    request,
	}
}

// GetUpdateType - returns update type
func (update *FieldUpdate) GetUpdateType() UpdateType {
	return update.updateType
}

// ComponentsUpdate - components update
type ComponentsUpdate struct {
	updateType UpdateType
	id         uint
	request    ComponentSetRequest
}

// NewComponentsUpdate - creates new component update
func NewComponentsUpdate(id uint, request ComponentSetRequest) ComponentsUpdate {
	return ComponentsUpdate{
		updateType: UpdateTypeComponents,
		id:         id,
		request:    request,
	}
}

// GetUpdateType - returns update type
func (update *ComponentsUpdate) GetUpdateType() UpdateType {
	return update.updateType
}

// AddComponentUpdate - add component update
type AddComponentUpdate struct {
	updateType UpdateType
	component  *Component
}

// NewAddComponentUpdate - creates new add component update
func NewAddComponentUpdate(component *Component) AddComponentUpdate {
	return AddComponentUpdate{
		updateType: UpdateTypeAddComponent,
		component:  component,
	}
}

// GetUpdateType - returns update type
func (update *AddComponentUpdate) GetUpdateType() UpdateType {
	return update.updateType
}

// RemoveComponentUpdate - remove component update
type RemoveComponentUpdate struct {
	updateType UpdateType
	id         uint
}

// NewRemoveComponentUpdate - creates new add component update
func NewRemoveComponentUpdate(id uint) RemoveComponentUpdate {
	return RemoveComponentUpdate{
		updateType: UpdateTypeRemoveComponent,
		id:         id,
	}
}

// GetUpdateType - returns update type
func (update *RemoveComponentUpdate) GetUpdateType() UpdateType {
	return update.updateType
}
