package models

import (
	"math"
)

// Field - type for a field
type Field struct {
	PageRadius uint
	Grid       map[uint64]*Page
}

const maxFieldRadius uint64 = 1000

var maxFieldRadiusSq = uint64(math.Pow(1000, 2))

// NewField - creates a new field
func NewField(pageRadius uint) Field {
	newField := Field{
		PageRadius: pageRadius,
		Grid:       make(map[uint64]*Page),
	}

	newField.Create(NewCoordinates(0, 0, 0))

	return newField
}

func key(p Coordinates) uint64 {
	return uint64(p.X) + 4*maxFieldRadius*uint64(p.Y) + 16*maxFieldRadiusSq*uint64(p.Z)
}

// Get - retrieves a page
func (field *Field) Get(p Coordinates) *Page {
	return field.Grid[key(p)]
}

// Create - creates a page
func (field *Field) Create(p Coordinates) *Page {
	newPage := NewPage(field.PageRadius, p)
	field.Grid[key(p)] = &newPage
	return &newPage
}
