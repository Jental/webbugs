package contracts

import "github.com/google/uuid"

// CellContract - contract for models.Cell
type CellContract struct {
	CellType uint                    `json:"type"`
	PlayerID uuid.UUID               `json:"playerID"`
	P        FullCoordinatesContract `json:"p"`
	IsBase   bool                    `json:"isBase"`
}
