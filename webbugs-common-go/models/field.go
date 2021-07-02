package models

import (
	"math"
	"sync"
)

// Field - type for a field
type Field struct {
	Radius uint
	Grid   *sync.Map
}

// NewField - creates new field
func NewField(radius uint) Field {
	var grid sync.Map
	newField := Field{
		Radius: radius,
		Grid:   &grid,
	}

	for x := -int64(radius) + 1; x < int64(radius)-1; x++ {
		for y := -int64(radius) + 1; y < int64(radius)-1; y++ {
			newField.Grid.Store(newField.key(NewCoordinates(x, y, 0-x-y)), nil)
		}
	}

	return newField
}

func (field *Field) key(crd Coordinates) int64 {
	return int64(crd.X) +
		4*int64(field.Radius)*int64(crd.Y) +
		16*int64(math.Pow(float64(field.Radius), 2))*int64(crd.Z)
}

// Get - retrieves a cell
func (field *Field) Get(crd Coordinates) *Cell {
	cell, ok := field.Grid.Load(field.key(crd))
	if ok && cell != nil {
		return cell.(*Cell)
	}

	return nil
}
