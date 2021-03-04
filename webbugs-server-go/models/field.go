package models

import (
	"math"
	"sync"
)

// Field - type for a field
type Field struct {
	PageRadius uint
	Grid       *sync.Map
}

// MaxFieldRadius - maximum field radius
const MaxFieldRadius int64 = 1000

var maxFieldRadiusSq = int64(math.Pow(1000, 2))

// NewField - creates a new field
func NewField(pageRadius uint) Field {
	var grid sync.Map
	newField := Field{
		PageRadius: pageRadius,
		Grid:       &grid,
	}

	newField.Create(NewCoordinates(0, 0, 0))

	return newField
}

func fkey(p Coordinates) int64 {
	return int64(p.X) + 4*MaxFieldRadius*int64(p.Y) + 16*maxFieldRadiusSq*int64(p.Z)
}

// Get - retrieves a page
func (field *Field) Get(p Coordinates) *Page {
	page, ok := field.Grid.Load(fkey(p))
	if ok {
		return page.(*Page)
	}

	return nil
}

// Create - creates a page
func (field *Field) Create(p Coordinates) *Page {
	newPage := NewPage(field.PageRadius, p)
	field.Grid.Store(fkey(p), &newPage)
	return &newPage
}
