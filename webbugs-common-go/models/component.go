package models

import "github.com/google/uuid"

// Component - type for a wall graph component
type Component struct {
	ID       uint
	IsActive bool
	Walls    []*Cell
}

var nextID uint = 0

// NewComponent - creates new component
func NewComponent(isActive bool, walls []*Cell) Component {
	nextID = nextID + 1
	return Component{
		ID:       nextID,
		IsActive: isActive,
		Walls:    walls,
	}
}

func (field *Field) CheckIfComponentActive(component *Component, playerID uuid.UUID) bool {
	for _, w := range component.Walls {
		for _, n := range field.GetNeibhours(w.Crd) {
			if n != nil && n.CellType == CellTypeBug && n.PlayerID == playerID {
				return true
			}
		}
	}

	return false
}
