package contract

import (
	"github.com/google/uuid"
)

// CoordinatesContract - contract for models.Coordinates
type CoordinatesContract struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
	Z int64 `json:"z"`
}

// FullCoordinatesContract - contract for models.FullCoordinates
type FullCoordinatesContract struct {
	Page CoordinatesContract `json:"page"`
	Cell CoordinatesContract `json:"cell"`
}

// CellContract - contract for models.Cell
type CellContract struct {
	CellType    uint                    `json:"type"`
	PlayerID    uuid.UUID               `json:"playerID"`
	ComponentID *string                 `json:"component_id"`
	P           FullCoordinatesContract `json:"p"`
	IsBase      bool                    `json:"isBase"`
}

// PageContract - contract for models.Page
type PageContract struct {
	Radius uint                    `json:"radius"`
	Grid   map[int64]*CellContract `json:"grid"`
	P      CoordinatesContract     `json:"p"`
}

// FieldContract - contract for models.Field
type FieldContract struct {
	PageRadius  uint                   `json:"pageRadius"`
	Grid        map[int64]PageContract `json:"grid"`
	Coordinates []CoordinatesContract  `json:"coordinates"`
}

// ComponentContract - contract for models.Component
type ComponentContract struct {
	ID       string                    `json:"id"`
	IsActive bool                      `json:"isActive"`
	WallIDs  []FullCoordinatesContract `json:"wall_ids"`
}

// DataContract - contract for field data
type DataContract struct {
	Field      FieldContract              `json:"field"`
	Components map[uint]ComponentContract `json:"components"`
}
