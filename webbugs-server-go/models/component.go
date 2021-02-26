package models

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
