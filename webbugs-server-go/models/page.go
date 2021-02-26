package models

import (
	"fmt"
	"math"
	"math/rand"

	"github.com/google/uuid"
)

// Page - type for a page
type Page struct {
	Radius uint
	Grid   map[int64]*Cell
	Crd    Coordinates
}

// NewPage - creates new page
func NewPage(radius uint, crd Coordinates) Page {
	newPage := Page{
		Radius: radius,
		Crd:    crd,
		Grid:   make(map[int64]*Cell),
	}

	for x := -int64(radius) + 1; x < int64(radius)-1; x++ {
		for y := -int64(radius) + 1; y < int64(radius)-1; y++ {
			newPage.Grid[newPage.key(NewCoordinates(x, y, 0-x-y))] = nil
		}
	}

	return newPage
}

func (page *Page) key(crd Coordinates) int64 {
	return int64(crd.X) +
		4*int64(page.Radius)*int64(crd.Y) +
		16*int64(math.Pow(float64(page.Radius), 2))*int64(crd.Z)
}

// Get - retrieves a cell
func (page *Page) Get(crd Coordinates) *Cell {
	return page.Grid[page.key(crd)]
}

// Set - sets or updates a cell
func (page *Page) Set(crd FullCoordinates, request *CellSetRequest) error {
	if request != nil {
		key := page.key(crd.Cell)
		cell, exists := page.Grid[key]
		if exists && cell != nil {
			if crd != cell.Crd {
				return fmt.Errorf("page: set: Unmatching coordinates: %v, %v", crd, cell.Crd)
			}

			cell.FillWithCellSetRequest(*request)
		} else {
			newCell := FromCellSetRequest(*request, crd)
			page.Grid[key] = &newCell
		}
	} else {
		key := page.key(crd.Cell)
		page.Grid[key] = nil
	}

	return nil
}

func incByX(crd Coordinates) Coordinates {
	return Coordinates{
		X: crd.X,
		Y: crd.Y - 1,
		Z: crd.Z + 1,
	}
}
func decByX(crd Coordinates) Coordinates {
	return Coordinates{
		X: crd.X,
		Y: crd.Y + 1,
		Z: crd.Z - 1,
	}
}
func incByY(crd Coordinates) Coordinates {
	return Coordinates{
		X: crd.X - 1,
		Y: crd.Y,
		Z: crd.Z + 1,
	}
}
func decByY(crd Coordinates) Coordinates {
	return Coordinates{
		X: crd.X + 1,
		Y: crd.Y,
		Z: crd.Z - 1,
	}
}
func incByZ(crd Coordinates) Coordinates {
	return Coordinates{
		X: crd.X + 1,
		Y: crd.Y - 1,
		Z: crd.Z,
	}
}
func decByZ(crd Coordinates) Coordinates {
	return Coordinates{
		X: crd.X - 1,
		Y: crd.Y + 1,
		Z: crd.Z,
	}
}

// GetNeibhourCoordinates - retrieves neighbour cell coordinates
func (page *Page) GetNeibhourCoordinates(crd Coordinates) []Coordinates {
	ns := [6]Coordinates{
		incByX(crd),
		decByX(crd),
		incByY(crd),
		decByY(crd),
		incByZ(crd),
		decByZ(crd),
	}

	result := make([]Coordinates, 6)
	i := 0

	for _, ncrd := range ns {
		if math.Abs(float64(ncrd.X)) < float64(page.Radius) && math.Abs(float64(ncrd.Y)) < float64(page.Radius) && math.Abs(float64(ncrd.Z)) < float64(page.Radius) {
			result[i] = ncrd
			i = i + 1
		}
	}

	return result
}

// GetNeibhours - retrieves neighbour cells
func (page *Page) GetNeibhours(crd Coordinates) []*Cell {
	crds := page.GetNeibhourCoordinates(crd)

	result := make([]*Cell, len(crds))

	for i, crd2 := range crds {
		result[i] = page.Get(crd2)
	}

	return result
}

// GetRandomEmptyCellCoordinates - retrieves coordinates of a random empty cell
func (page *Page) GetRandomEmptyCellCoordinates(result chan Coordinates) {
	for {
		p := Coordinates{
			X: int64(rand.Int63n(2*int64(page.Radius)-1)) - int64(page.Radius) + 1,
			Y: int64(rand.Int63n(2*int64(page.Radius)-1)) - int64(page.Radius) + 1,
			Z: 0,
		}
		p.Z = 0 - p.X - p.Y

		if math.Abs(float64(p.Z)) >= float64(page.Radius) {
			continue
		}

		key := page.key(p)
		cell, exists := page.Grid[key]
		if !exists || cell == nil {
			result <- p
			break
		}
	}
}

// GetPlayerCells - retrieves all player cells
func (page *Page) GetPlayerCells(playerID uuid.UUID) []*Cell {
	result := make([]*Cell, 0)
	for _, cell := range page.Grid {
		if cell != nil && cell.PlayerID == playerID {
			result = append(result, cell)
		}
	}
	return result
}

// RemovePlayerCells - removes all player cells
func (page *Page) RemovePlayerCells(playerID uuid.UUID) {
	cells := page.GetPlayerCells(playerID)
	for _, cell := range cells {
		page.Set(cell.Crd, nil)
	}
}
