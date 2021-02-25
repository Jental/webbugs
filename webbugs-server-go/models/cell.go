package models

import (
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
	Crd       FullCoordinates
	Component *Component
	IsBase    bool
}

// NewBugCell - creates a new cell of the bug type
func NewBugCell(playerID uuid.UUID, crd FullCoordinates, isBase bool) Cell {
	return Cell{
		CellType:  CellTypeBug,
		PlayerID:  playerID,
		Crd:       crd,
		Component: nil,
		IsBase:    isBase,
	}
}

// NewWallCell - creates a new cell of the wall type
func NewWallCell(playerID uuid.UUID, crd FullCoordinates, component *Component) Cell {
	return Cell{
		CellType:  CellTypeBug,
		PlayerID:  playerID,
		Component: component,
		Crd:       crd,
		IsBase:    false,
	}
}

// FillWithCellSetRequest - fills a cell with a request data
func (cell *Cell) FillWithCellSetRequest(request CellSetRequest) {
	if request.PlayerID != uuid.Nil {
		cell.PlayerID = request.PlayerID
	}
	if request.CellType != nil {
		cell.CellType = *request.CellType
	}
	if request.Component != nil {
		cell.Component = request.Component
	}
	if request.IsBase != nil {
		cell.IsBase = *request.IsBase
	}
}

// FromCellSetRequest - creates a new cell from CellSetRequest
func FromCellSetRequest(request CellSetRequest, crd FullCoordinates) Cell {
	newCell := Cell{}
	newCell.Crd = crd

	newCell.FillWithCellSetRequest(request)

	return newCell
}
