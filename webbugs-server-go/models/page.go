package models

import (
	"fmt"
	"math"
	"math/rand"
	"sync"

	"github.com/google/uuid"
)

// Page - type for a page
type Page struct {
	Radius uint
	Grid   *sync.Map
	Crd    Coordinates
}

// NewPage - creates new page
func NewPage(radius uint, crd Coordinates) Page {
	var grid sync.Map
	newPage := Page{
		Radius: radius,
		Crd:    crd,
		Grid:   &grid,
	}

	for x := -int64(radius) + 1; x < int64(radius)-1; x++ {
		for y := -int64(radius) + 1; y < int64(radius)-1; y++ {
			newPage.Grid.Store(newPage.key(NewCoordinates(x, y, 0-x-y)), nil)
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
	cell, ok := page.Grid.Load(page.key(crd))
	if ok && cell != nil {
		return cell.(*Cell)
	}

	return nil
}

// Set - sets or updates a cell
func (page *Page) Set(crd FullCoordinates, request *CellSetRequest) error {
	if request != nil {
		key := page.key(crd.Cell)
		celli, exists := page.Grid.Load(key)
		if exists && celli != nil {
			cell := celli.(*Cell)
			if crd != cell.Crd {
				return fmt.Errorf("page: set: Unmatching coordinates: %v, %v", crd, cell.Crd)
			}

			cell.FillWithCellSetRequest(*request)
		} else {
			newCell := FromCellSetRequest(*request, crd, page)
			page.Grid.Store(key, &newCell)
		}
	} else {
		key := page.key(crd.Cell)
		page.Grid.Store(key, nil)
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

func AreNeighbours(crd0 Coordinates, crd1 Coordinates) bool {
	return (crd0.X == crd1.X && math.Abs(float64(crd0.Y)-float64(crd1.Y)) == 1) ||
		(crd0.Y == crd1.Y && math.Abs(float64(crd0.X)-float64(crd1.X)) == 1) ||
		(crd0.Z == crd1.Z && math.Abs(float64(crd0.Y)-float64(crd1.Y)) == 1)
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

// GetOwnWallNeibhours - retrieves neighbour wall cells of a player
func (page *Page) GetOwnWallNeibhours(crd Coordinates, playerID uuid.UUID) []*Cell {
	crds := page.GetNeibhourCoordinates(crd)

	result := make([]*Cell, 0)

	for _, crd2 := range crds {
		cell := page.Get(crd2)
		if cell != nil && cell.PlayerID == playerID && cell.CellType == CellTypeWall {
			result = append(result, cell)
		}
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
		cell, exists := page.Grid.Load(key)
		if !exists || cell == nil {
			result <- p
			break
		}
	}
}

// GetPlayerCells - retrieves all player cells
func (page *Page) GetPlayerCells(playerID uuid.UUID) []*Cell {
	result := make([]*Cell, 0)
	page.Grid.Range(func(key interface{}, celli interface{}) bool {
		if celli != nil {
			cell := celli.(*Cell)
			if cell.PlayerID == playerID {
				result = append(result, cell)
			}
		}
		return true
	})

	return result
}

// RemovePlayerCells - removes all player cells
func (page *Page) RemovePlayerCells(playerID uuid.UUID) {
	cells := page.GetPlayerCells(playerID)
	for _, cell := range cells {
		page.Set(cell.Crd, nil)
	}
}
