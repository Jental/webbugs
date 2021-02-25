package models

import (
	"math"
)

// Field - type for a field
type Field struct {
	PageRadius uint
	Grid       map[int64]*Page
}

const maxFieldRadius int64 = 1000

var maxFieldRadiusSq = int64(math.Pow(1000, 2))

// NewField - creates a new field
func NewField(pageRadius uint) Field {
	newField := Field{
		PageRadius: pageRadius,
		Grid:       make(map[int64]*Page),
	}

	newField.Create(NewCoordinates(0, 0, 0))

	return newField
}

func fkey(p Coordinates) int64 {
	return int64(p.X) + 4*maxFieldRadius*int64(p.Y) + 16*maxFieldRadiusSq*int64(p.Z)
}

// Get - retrieves a page
func (field *Field) Get(p Coordinates) *Page {
	return field.Grid[fkey(p)]
}

// Create - creates a page
func (field *Field) Create(p Coordinates) *Page {
	newPage := NewPage(field.PageRadius, p)
	field.Grid[fkey(p)] = &newPage
	return &newPage
}
