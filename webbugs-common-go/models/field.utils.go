package models

import (
	"math"
	"math/rand"

	"github.com/google/uuid"
)

// GetNeibhourCoordinates - retrieves neighbour cell coordinates
func (field *Field) GetNeibhourCoordinates(crd Coordinates) []Coordinates {
	ns := [6]Coordinates{
		crd.IncByX(),
		crd.DecByX(),
		crd.IncByY(),
		crd.DecByY(),
		crd.IncByZ(),
		crd.DecByZ(),
	}

	result := make([]Coordinates, 0)
	for _, ncrd := range ns {
		if math.Abs(float64(ncrd.X)) < float64(field.Radius) && math.Abs(float64(ncrd.Y)) < float64(field.Radius) && math.Abs(float64(ncrd.Z)) < float64(field.Radius) {
			result = append(result, ncrd)
		}
	}

	return result
}

// GetNeibhours - retrieves neighbour cells
func (field *Field) GetNeibhours(crd Coordinates) []*Cell {
	crds := field.GetNeibhourCoordinates(crd)

	result := make([]*Cell, len(crds))

	for i, crd2 := range crds {
		result[i] = field.Get(crd2)
	}

	return result
}

// GetOwnWallNeibhours - retrieves neighbour wall cells of a player
func (field *Field) GetOwnWallNeibhours(crd Coordinates, playerID uuid.UUID) []*Cell {
	crds := field.GetNeibhourCoordinates(crd)

	result := make([]*Cell, 0)

	for _, crd2 := range crds {
		cell := field.Get(crd2)
		if cell != nil && cell.PlayerID == playerID && cell.CellType == CellTypeWall {
			result = append(result, cell)
		}
	}

	return result
}

// GetRandomEmptyCellCoordinates - retrieves coordinates of a random empty cell
func (field *Field) GetRandomEmptyCellCoordinates(result chan Coordinates) {
	for {
		p := Coordinates{
			X: int64(rand.Int63n(2*int64(field.Radius)-1)) - int64(field.Radius) + 1,
			Y: int64(rand.Int63n(2*int64(field.Radius)-1)) - int64(field.Radius) + 1,
			Z: 0,
		}
		p.Z = 0 - p.X - p.Y

		if math.Abs(float64(p.Z)) >= float64(field.Radius) {
			continue
		}

		key := field.key(p)
		cell, exists := field.Grid.Load(key)
		if !exists || cell == nil {
			result <- p
			break
		}
	}
}

// GetPlayerCells - retrieves all player cells
func (field *Field) GetPlayerCells(playerID uuid.UUID) []*Cell {
	result := make([]*Cell, 0)
	field.Grid.Range(func(key interface{}, celli interface{}) bool {
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
