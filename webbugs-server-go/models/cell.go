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
	Crd       FullCoordinates
	Page      *Page
	Component *Component
	IsBase    bool
	CreatedAt time.Time
}

// NewBugCell - creates a new cell of the bug type
func NewBugCell(playerID uuid.UUID, crd FullCoordinates, page *Page, isBase bool) Cell {
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
func NewWallCell(playerID uuid.UUID, crd FullCoordinates, page *Page, component *Component) Cell {
	return Cell{
		CellType:  CellTypeBug,
		PlayerID:  playerID,
		Component: component,
		Crd:       crd,
		IsBase:    false,
		CreatedAt: time.Now().UTC(),
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
func FromCellSetRequest(request CellSetRequest, crd FullCoordinates, page *Page) Cell {
	newCell := Cell{}
	newCell.Crd = crd
	newCell.Page = page

	newCell.FillWithCellSetRequest(request)

	return newCell
}
