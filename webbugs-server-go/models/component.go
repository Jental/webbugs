package models

// Component - type for a wall graph component
type Component struct {
	ID       uint
	IsActive bool
	Walls    []Cell
}
