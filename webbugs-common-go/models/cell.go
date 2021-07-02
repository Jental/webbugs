package models

import (
	"time"

	"github.com/google/uuid"
)

// CellType - type of a cell
type CellType uint8

// Cell types
const (
	CellTypeBug  CellType = 1
	CellTypeWall CellType = 2
)

// Cell - struct for on cell
type Cell struct {
	CellType  CellType
	PlayerID  uuid.UUID
	Crd       Coordinates
	Component *Component
	IsBase    bool
	CreatedAt time.Time
}

// NewBugCell - creates a new cell of the bug type
func NewBugCell(playerID uuid.UUID, crd Coordinates, isBase bool) Cell {
	return Cell{
		CellType:  CellTypeBug,
		PlayerID:  playerID,
		Crd:       crd,
		Component: nil,
		IsBase:    isBase,
		CreatedAt: time.Now().UTC(),
	}
}

// NewWallCell - creates a new cell of the wall type
func NewWallCell(playerID uuid.UUID, crd Coordinates, component *Component) Cell {
	return Cell{
		CellType:  CellTypeWall,
		PlayerID:  playerID,
		Component: component,
		Crd:       crd,
		IsBase:    false,
		CreatedAt: time.Now().UTC(),
	}
}
